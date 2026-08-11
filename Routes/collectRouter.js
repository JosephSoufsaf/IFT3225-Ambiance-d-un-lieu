const Measurement = require("../models/Measurement");
const Observation = require('../models/Observation')
const express = require('express');
const router = new express.Router();
const Location = require('../models/Location');
const cache = require('../lib/cache');

const { auth, tokenAuth } = require('../middlewares/middleware');

router.post("/measurements", auth, async (req, res) => {
    try {
        const { type, value, unit, location, timestamp, deviceId } = req.body;

        if (!type || !value || !unit || !location || !timestamp || !deviceId) {
            return res.status(400).json({ success: false, error: "Champs manquants" });
        }
   
        const measurement = new Measurement ({ type, value, unit, location, timestamp, deviceId });
        await measurement.save();
        return res.status(201).json({ success: true, data: measurement });

    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

router.post("/observations", tokenAuth, async (req, res) => {
    try {
        const { location, proximity, vibe, notes, timestamp } = req.body;

        if (!location || !proximity || !vibe || !timestamp) {
            return res.status(400).json({ success: false, error: "Champs manquants" });
        }

        const manualLog = new Observation({
            location,
            proximity,
            vibe,
            notes,
            timestamp,
            author: req.user._id
        });

        await manualLog.save();
        cache.invalidate('portrait:${location}');
        const locationObject = await Location.findOne({ name: location });

        if (locationObject) {
            const alreadyObserved = req.user.savedLocations.some((saved) =>
                saved.location.toString() === locationObject._id.toString() &&
                saved.category === 'observed'
            );
            if (!alreadyObserved) {
                req.user.savedLocations.push({ location: locationObject, category: 'observed' });
                await req.user.save();
            }
        }
        
        return res.status(201).json({ success: true, data: manualLog });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router; 