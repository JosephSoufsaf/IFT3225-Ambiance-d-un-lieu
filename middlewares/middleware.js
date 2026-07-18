const Device = require('../models/Device');
const User = require('../models/User');

async function auth(req, res, next) {
    try {
        
        const apiKey = req.headers['x-api-key']
        
        if (!apiKey) {
            return res.status(401).json({ error: "En-tête x-api-key absent" });
        }
        
        const device = await Device.findOne({ apiKey });
        if (!device) {
            return res.status(403).json({ error: "Clé API invalide" });
        }
        req.device = device;
        next();
        
    } catch (error) {
        next(error)
    }
}

async function userValidation (req, res, next) {
    try {
        const email = req.body.email;
        const password = req.body.password;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, error: "Champ (email/password) requis manquant" });
        }
    
        const user = await User.validateUser(email, password);

        req.user = user;
        next();
    
    } catch (error) {
        next(error);
    }
}

async function tokenAuth (req, res, next) {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).send("Pas de header Authorization avec Bearer token");
        }

        const authToken = authHeader.replace("Bearer ", "");

        const user = await User.findOne({'authTokens.authToken': authToken});
        
        req.user = user;
        req.authToken = authToken;
        next();

    } catch (error) {
        console.log(error);
        next(error);
    }
}

module.exports = {auth, userValidation, tokenAuth};