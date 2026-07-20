const { tokenAuth } = require("../middlewares/middleware");
const Location = require("../models/Location");
const express = require('express');
const router = new express.Router();


router.get('/locations', async (req, res) => {
    try {
        const locations = await Location.find({});
        return res.status(200).json({ success: true, data: locations });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});


router.get('/locations/:name', async (req, res) => {
    try {
        const location = await Location.findOne({ name: req.params.name });
        if (!location) {
            return res.status(404).json({ success: false, error: "Ce lieu n'existe pas" });
        }
        return res.status(200).json({ success: true, data: location });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});


router.post('/locations', async (req, res) => {
    try {
        const { name, latitude, longitude } = req.body;

        if (!name || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ success: false, error: "Champ requis manquant" });
        }

        const existingLocation = await Location.exists({ name });
        if (existingLocation) {
            return res.status(409).json({ success: false, error: "Ce lieu existe déjà" });
        }

        const location = new Location({ name, latitude, longitude });
        await location.save();
        return res.status(201).json({ success: true, data: location });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/userLocations', tokenAuth, async (req,res) => {
    try {
        const {locationName, locationCategory} = req.body;
        const locationObject = await Location.findOne({ name: locationName})
        console.log('location : ', locationObject._id.toString());

        const alreadySavedLocations = await req.user.savedLocations.some((savedLocation) => {
            return savedLocation.location.toString() == locationObject._id.toString() &&
            savedLocation.category == locationCategory
        });
        if (alreadySavedLocations) {
            return res.status(409).json({ success: false, error: "Ce lieu est déjà favori" });
        }
        console.log('already saved : ', alreadySavedLocations);

        req.user.savedLocations.push({
            location: locationObject,
            category: locationCategory
        });
        await req.user.save();

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message })
    }
});

router.delete('/userLocations', tokenAuth, async (req,res) => {
    try {
        
        console.log('User favorite locations : ', req.user.savedLocations);

        const {locationName, locationCategory} = req.body;
        const locationObject = await Location.findOne({ name: locationName});

        const filteredLocations = req.user.savedLocations.filter((savedLocation) => {
            return savedLocation.location.toString() != locationObject._id.toString() ||
            savedLocation.category != locationCategory 
        });
        console.log('filtered locations : ', filteredLocations);

        if (req.user.savedLocations == filteredLocations) {
            return res.status(204).json({success: true, message: "Le lieu n'est déja pas dans les favoris"});
        } else {
            req.user.savedLocations = filteredLocations;
        }
        
        console.log('new User favorite locations : ',req.user.savedLocations);

        await req.user.save();

        return res.status(200).json({ success: true, data: filteredLocations});

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;