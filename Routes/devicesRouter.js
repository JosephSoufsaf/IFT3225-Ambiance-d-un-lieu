const Device = require("../models/Device");
const express = require('express');
const router = new express.Router();
const crypto = require('crypto');

router.post('/devices', async (req, res) => {
    try{
        const name = req.body.name;
        const apiKey = crypto.randomBytes(32).toString('hex');
        

        if (!name){
            return res.status(400).json({ success: false, error: "Champ requis manquant: name" });
        }
        
        const device = new Device({name, apiKey});
        await device.save();
        return res.status(201).json({success: true, data: device});

    }catch(error){
        return res.status(400).json({ success: false, error: error.message });
    }
})

router.get('/devices', async (req, res) => {
    try{
        const devices = await Device.find({});
        return res.status(200).json({success:true, data:devices})
    }catch(error){
        return res.status(500).json({ success: false, error: error.message });
    }

})

module.exports = router;

