const Device = require('../models/Device');

async function auth(req, res, next) {
    const apiKey = req.headers['x-api-key']

    if (!apiKey) {
        return res.status(401).json({ error: "En-tête x-api-key absent" });
    }

    const device = await Device.findOne({ apiKey });
    if (!device) {
        return res.status(403).json({ error: "Clé API invalide" });
    }

    next();

}
module.exports = auth;