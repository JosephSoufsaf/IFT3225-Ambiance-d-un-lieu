const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config(); 
const Device = require('./models/Device'); 
const Measurement = require('./models/Measurement');
const Observation = require('./models/Observation');
const Location = require('./models/Location');
const User = require('./models/User');

const MONGO_URI = process.env.MONGODB_URI;

const argBaseline = parseFloat(process.argv[2]); // argument for noise baseline
const NOISE_BASELINE = !isNaN(argBaseline) ? argBaseline : 35.0; // defaults to 35 dB

const startOffset = parseInt(process.argv[3]) || 30; // default 30
const endOffset = parseInt(process.argv[4]) || 0;    // default 0

const LOCATION_NAME = process.argv[5] || 'demo_location';
const LOCATION_LAT = parseFloat(process.argv[6]) || 45.5017;
const LOCATION_LNG = parseFloat(process.argv[7]) || -73.5673;

async function seedDatabase() {
    try {
        console.log("attaching network socket to MongoDB Atlas...");
        
        await mongoose.connect(MONGO_URI);

        const targetDevice = await Device.findOneAndUpdate(
            { name: 'demo_device' },
            { $setOnInsert: { apiKey: crypto.randomBytes(32).toString('hex') } },
            { upsert: true, new: true, setDefaultsOnInsert: true } // update and insert
        );

        console.log(`device: ${targetDevice.name}`);
        console.log(`device api key: ${targetDevice.apiKey}`);

        // ensure the Location exists so the seeded data shows up in the app
        const targetLocation = await Location.findOneAndUpdate(
            { name: LOCATION_NAME },
            { $setOnInsert: { latitude: LOCATION_LAT, longitude: LOCATION_LNG } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log(`location: ${targetLocation.name} (${targetLocation.latitude}, ${targetLocation.longitude})`);

        // ensure a demo user exists to act as the observation's author
        let demoUser = await User.findOne({ email: 'demo@ambiance.local' });
        if (!demoUser) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('demo_password_123', 10);
            demoUser = await User.create({
                email: 'demo@ambiance.local',
                username: 'demo_user',
                password: hashedPassword
            });
            console.log('created demo user for seeded observations');
        }

        const now = new Date();
        const measurementsToInsert = [];
        const observationsToInsert = [];
        
        // generate data over time frame (every 2 minutes)
        for (let minuteOffset = startOffset; minuteOffset >= endOffset; minuteOffset -= 2) {
            const logTime = new Date(now.getTime() - minuteOffset * 60 * 1000);
            const isoUTCString = logTime.toISOString();

            // check if it already exists
            const existingMeasurement = await Measurement.findOne({ 
                location: LOCATION_NAME, 
                timestamp: isoUTCString 
            });

            if (!existingMeasurement) {
                const randomFluctuation = (Math.random() * 6) - 3; 
                const soundValue = NOISE_BASELINE + randomFluctuation;

                measurementsToInsert.push({
                    type: 'soundPressureLevel',
                    value: Math.round(soundValue * 100) / 100,
                    unit: 'dB',
                    location: LOCATION_NAME,
                    timestamp: isoUTCString,
                    deviceId: targetDevice._id
                });
            }
        }

        const observationTimeUTC = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
        const existingObservation = await Observation.findOne({ 
            location: LOCATION_NAME, 
            timestamp: observationTimeUTC 
        });

        if (!existingObservation) {
            let autoVibe = 'Modéré';
            if (NOISE_BASELINE > 50) { autoVibe = 'Bruyant'; }
            if (NOISE_BASELINE < 30) { autoVibe = 'Très Calme'; }
            if (NOISE_BASELINE < 40) { autoVibe = 'Calme'; }

            observationsToInsert.push({
                location: LOCATION_NAME, 
                proximity: 'demo_proximity', 
                vibe: autoVibe,
                notes: 'demo_notes',
                timestamp: observationTimeUTC, 
                deviceId: targetDevice._id,
                author: demoUser._id
            });
        }

        if (measurementsToInsert.length > 0) {
            await Measurement.insertMany(measurementsToInsert);
            console.log(`added ${measurementsToInsert.length} new measurements.`);
        }

        if (observationsToInsert.length > 0) {
            await Observation.insertMany(observationsToInsert);
            console.log(`added ${observationsToInsert.length} new observation.`);
        }

        console.log('added data to DB');
        
    } catch (error) {
        console.error('seeding failed', error);
    } finally {
        await mongoose.disconnect();
        console.log('closing connection');
        process.exit(0);
    }
}

seedDatabase();