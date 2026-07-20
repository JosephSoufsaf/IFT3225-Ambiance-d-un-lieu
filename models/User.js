const mongoose = require('mongoose'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required:true
    },
    username:{
        type: String,
        required: true,
        unique: true
    },
    authTokens: [{
        authToken: {
            type: String,
            unique: true
        }
    }],
    savedLocations: [{
        location : {
            type: mongoose.Schema.Types.ObjectId, 
            ref:'location',
            required: true
        },
        category : {
            type: String,
            enum: ['favorite', 'observed'],
            required: true
        }
    }]
});

UserSchema.statics.validateUser = async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) {
        throw new Error("Erreur : le compte recherché n'existe pas !");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Erreur : le mot de passe n'est pas valide !");
    }
    return user;
};

UserSchema.methods.generateAuthTokenAndSaveUser = async function() {
    const user = this;

    const authToken = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '24h' });
    user.authTokens.push({ authToken });

    await this.save();
    return authToken;
};

module.exports = mongoose.model("User", UserSchema) ;