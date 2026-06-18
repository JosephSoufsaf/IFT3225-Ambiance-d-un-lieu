const mongoose = require('mongoose');

const devicesSchema = new mongoose.Schema({  
    name: {
        type: String,
        required: true,
    },
    apiKey: {
        type: String,
        unique: true,
        required:true
    }
})

module.exports = mongoose.model("device", devicesSchema);