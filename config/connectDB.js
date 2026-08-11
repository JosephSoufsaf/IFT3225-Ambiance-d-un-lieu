const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

function connectMongo () {
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch((err) => console.log(err));
};

module.exports = connectMongo;