const mongoose = require('mongoose');

const measurementsSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    value:{
        type: Number,
        required:true
    },
    unit:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true   
    },
    timestamp:{
        type:Date,
        required:true
    },
    deviceId:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },	
	receivedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Measurement", measurementsSchema);