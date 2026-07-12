const User = require("../models/User");
const express = require('express');
const router = new expres.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');



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
      return res.status(409).json({success: false, errror: "Email ou nom d'utilisateur deja utulise"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({hashedPassword});
    return res.status(201).json({success:true, data: newUser});

  }catch(error){
    return res.status(400).json({success:false, error: error.message});
    
  }

})