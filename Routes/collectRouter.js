const Measurement = require("../models/Measurement");
const Observation = require('../models/Observation')
const express = require('express');
const router = new express.Router();
const {auth} = require('../middlewares/middleware');

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

router.post("/observations", auth, async (req, res) => {
    try {
        const { location, proximity, vibe, notes, timestamp, deviceId } = req.body;

        if (!location || !proximity || !vibe || !timestamp || !deviceId) {
            return res.status(400).json({ success: false, error: "Champs manquants" });
        }

        const manualLog = new Observation({location, proximity, vibe, notes, timestamp, deviceId}); 

        await manualLog.save();
        return res.status(201).json({ success: true, data: manualLog });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;