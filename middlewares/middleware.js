const Device = require('../models/Device');

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
module.exports = {auth, userValidation};