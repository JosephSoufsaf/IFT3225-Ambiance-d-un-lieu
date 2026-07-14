const User = require("../models/User");
const express = require('express');
const router = new express.Router();
const bcrypt = require('bcryptjs');



router.post('/register', async (req, res) =>{
  try{
    const password = req.body.password;
    const email = req.body.email;
    const username = req.body.username;

    //verify that fields were sent properly
    if (!username || !email || !password){
      return res.status(400).json({ success: false, error: "Champ requis manquant" });
    }

    
    //verify if email and username exist
    const emailTaken = await User.exists({email});
    const usernameTaken = await User.exists({username});

    if (emailTaken || usernameTaken){
      return res.status(409).json({success: false, error: "Email ou nom d'utilisateur deja utulise"});
    }

    //hashing password for extra security. Not sure if it helps that much
    const hashedPassword = await bcrypt.hash(password, 10);
    
    

    const newUser = new User({hashedPassword});
    await newUser.save();
    
    
    return res.status(201).json({success:true, 
      data: { _id: newUser._id, email: newUser.email, username: newUser.username }});

  }catch(error){
    return res.status(400).json({success:false, error: error.message});
    
  }

})