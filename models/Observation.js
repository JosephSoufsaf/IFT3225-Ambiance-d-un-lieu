const mongoose = require('mongoose')

const observationsSchema = new mongoose.Schema({
    // should we add a type or not
    location:{
        type:String,
        required:true
    },
    proximity:{
        type:String,
        required:true
    },
    vibe:{
        type:String,
        required:true,
    },
    notes:{
        type:String,
        required:false
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
})

module.exports = mongoose.model("Observations", observationsSchema);