const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: { type: String, required: true},
    latitude: Number,
    longitude: Number,
})

module.exports = mongoose.model('location', locationSchema);