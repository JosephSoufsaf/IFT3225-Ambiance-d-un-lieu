const Location = require("../models/Location");
const express = require('express');
const router = new express.Router();


router.get('/locations', async(req, res) =>{
    try{
        const name = req.body.name;
        const longitude = req.body.longitude;
        const latitute = req.body.latitute;

        if (!name || !longitude || !latitute){
            return res.status(400).json({ success: false, error: "Champ requis manquant" });
        }

        const locations = await Location.find({name, longitude, latitude})
        if (locations.length === 0){
            return res.status(404).json({success: false, error: "This specific ressource does not exist"})
        } else{
            return res.status(200).json({success:true, locations})
            console.log()
        }
        
    }catch(error){
        return res.status(400).json({success:false, error: error.message});
    }
})