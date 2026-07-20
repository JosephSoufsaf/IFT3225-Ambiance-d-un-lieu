const User = require("../models/User");
const express = require('express');
const router = new express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { userValidation, tokenAuth } = require('../middlewares/middleware')



router.post('/register', async (req, res) =>{
  try{
    const password = req.body.password;
    const email = req.body.email;
    const username = req.body.username;

    if (!username || !email || !password){
      return res.status(400).json({ success: false, error: "Champ requis manquant" });
    }
    
    const emailTaken = await User.exists({email});
    const usernameTaken = await User.exists({username});

    if (emailTaken || usernameTaken){
      return res.status(409).json({success: false, error: "Email ou nom d'utilisateur deja utulise"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, username, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({success:true, data: { _id: newUser._id, email: newUser.email, username: newUser.username }});

  }catch(error){
    return res.status(400).json({success:false, error: error.message});
  }
});

router.post("/login", userValidation ,async (req, res) => {
    try {

        const user = req.user;
        const authToken = await user.generateAuthTokenAndSaveUser();

        res.status(200).send({ user, authToken });

    } catch (e) {
        res.status(400).send(e.message);
    }
});

router.delete("/logout", tokenAuth, async (req, res) => {
    try {
        console.log(req.user, req.authToken);
        
        req.user.authTokens = [];
        await req.user.save();
        res.send("Déconnexion effectuée avec succès !");
    } catch (e) {
        res.status(500).send(e.message);
    }
});

router.delete("/account/:id", userValidation, async (req, res) => {
    try {

        //url id has to be the one of the user now and not another user's
         if (req.params.id !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: "Vous ne pouvez supprimer que votre propre compte" });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        // Trouver propriété _id dans le document de l'utilisateur

        if (!user) {
            return res.status(404).send({ error: "Utilisateur introuvable" });
        }

        return res.status(201).json({success: true, data: user, message: "Compte supprimé"});

    } catch (e) {
        res.status(500).send(e.message);
    }
});

module.exports = router;