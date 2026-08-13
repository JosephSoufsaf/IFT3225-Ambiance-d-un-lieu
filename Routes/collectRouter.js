const Measurement = require("../models/Measurement");
const Observation = require('../models/Observation')
const express = require('express');
const router = new express.Router();
const Location = require('../models/Location');

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

// Logique pour ajout lieu à l'utilisateur lors d'ajout d'observation
const shouldAddLocation = (savedLocations, locationId) => {
    const alreadyObserved = savedLocations.some((saved) =>
        saved.location.toString() === locationId.toString() &&
        saved.category === 'observed'
    );
    return !alreadyObserved;
}

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
        
        const locationObject = await Location.findOne({ name: location });

        if (locationObject && shouldAddLocation(req.user.savedLocations, locationObject._id)) {
            req.user.savedLocations.push({ location: locationObject, category: 'observed' });
            await req.user.save();
        }
        
        return res.status(201).json({ success: true, data: manualLog });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = {router, shouldAddLocation}; 