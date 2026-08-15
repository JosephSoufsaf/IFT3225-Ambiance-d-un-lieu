const Measurement = require("../models/Measurement");
const Observation = require('../models/Observation')
const express = require('express');
const router = new express.Router();
const cache = require('../lib/cache');
const cacheTimer = 45 * 1000

const computeRankings = (measurements) => {
    // Groupe par heure
    const hourlyGroups = {};
    measurements.forEach(m => {
        const hour = new Date(m.timestamp).getHours();
        if (!hourlyGroups[hour]) {
            hourlyGroups[hour] = { total: 0, count: 0 };
        }
        hourlyGroups[hour].total += m.value;
        hourlyGroups[hour].count += 1;
    });

    // Calcule la moyenne par heure et trie
    return Object.entries(hourlyGroups)
        .map(([hour, data]) => ({
            hourSlot24h: parseInt(hour),
            averageSoundDb: Math.round((data.total / data.count) * 100) / 100,
            sampleDensity: data.count
        }))
        .sort((a, b) => a.averageSoundDb - b.averageSoundDb);
}

router.get("/ambiance/:location/quiet-hours", async (req, res) => {
    try {
        const { location } = req.params;

        // Récupère toutes les mesures du lieu
        const measurements = await Measurement.find({
            location,
            type: "soundPressureLevel"
        });

        if (measurements.length === 0) {
            return res.status(200).json({ success: true, location, hourlyRanking: [] });
        }

        const hourlyRanking = computeRankings(measurements);

        return res.status(200).json({ success: true, location, hourlyRanking });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

const calculateTimeOffset = (lastQuery) => {
    let timeOffset = 3 * 60 * 60 * 1000; // default
    const match = lastQuery.toString().match(/^(\d+(\.\d+)?)([mhd])$/i); // regex for minutes, hours or days

    if (match) {
        const numericValue = parseFloat(match[1]);
        const timeUnitIndicator = match[3].toLowerCase();

        switch (timeUnitIndicator) {
            case 'm': // minutes
                timeOffset = numericValue * 60 * 1000;
                break;
            case 'h': // hours
                timeOffset = numericValue * 60 * 60 * 1000;
                break;
            case 'd': // days
                timeOffset = numericValue * 24 * 60 * 60 * 1000;
                break;
        }
    } else if (!isNaN(lastQuery)) { // default to hours if just a number
        timeOffset = parseFloat(lastQuery) * 60 * 60 * 1000;
    }
    return timeOffset;
}

router.get("/ambiance/:location/history", async (req, res) => {
    try {
        const { location } = req.params;
        const lastQuery = req.query.last || "3h"; // default to 3h if nothing there
        const timeOffset = calculateTimeOffset(lastQuery);
        const startTime = new Date(Date.now() - timeOffset)

        const measurements = await Measurement.find({
            location,
            timestamp: { $gte: startTime }
        }).sort({ timestamp: 1 });

        if (measurements.length === 0) {
            return res.status(200).json({
                success: true,
                location,
                timeWindow: lastQuery,
                count: 0,
                history: [] // return explicitly empty list
            });
        }

        return res.status(200).json({
            success: true,
            location,
            timeWindow: lastQuery,
            count: measurements.length,
            history: measurements
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

const classifyNoise = (average) => {

    let classification = "Modéré";
    if (average < 30) classification = "Très Calme";
    else if (average < 40) classification = "Calme";
    else if (average > 50) classification = "Bruyant";

    return classification;
}

router.get("/ambiance/:location/portrait", async (req, res) => {
    try {
        const { location } = req.params;
        const cacheKey = 'portrait:${location}';

        const cached = cache.get(cacheKey);
        if (cached) {
            return res.status(200).json({ ...cached, fromCache: true });
        }

        const cutoffTime = new Date(Date.now() - 30 * 60 * 1000);

        const measurements = await Measurement.find({
            location,
            type: "soundPressureLevel",
            timestamp: { $gte: cutoffTime }
        });

        const lastObservation = await Observation.findOne({ location })
            .sort({ timestamp: -1 });

        if (measurements.length === 0) {
            // Refactored par Claude
            const payload = {
                success: true,
                location,
                message: "Aucune donnée récente.",
                status: "Unknown",
                semanticPortrait: {
                    noiseClass: "Inconnue",
                    humanProximity: lastObservation ? lastObservation.proximity : "Inconnue",
                    reportedVibe: lastObservation ? lastObservation.vibe : "Inconnue"
                }
            };
            cache.set(cacheKey, payload, cacheTimer);
            return res.status(200).json(payload);
        }
        const average = measurements.reduce((sum, m) => sum + m.value, 0) / measurements.length;

        const classification = classifyNoise(average);

        // Même refactor par Claude qu'à la ligne 128
        const payload = {
            success: true,
            location,
            generatedAt: new Date().toISOString(),
            dataPointsAnalyzed: measurements.length,
            averageSoundDb: Math.round(average * 100) / 100,
            semanticPortrait: {
                noiseClass: classification,
                humanProximity: lastObservation ? lastObservation.proximity : "Inconnue",
                reportedVibe: lastObservation ? lastObservation.vibe : "Inconnue"
            }
        };

        cache.set(cacheKey, payload, PORTRAIT_CACHE_TTL_MS);
        return res.status(200).json(payload);

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = {router, computeRankings, calculateTimeOffset, classifyNoise};