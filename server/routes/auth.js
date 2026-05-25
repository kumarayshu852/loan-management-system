const express =require('express');
const router =express.Router();
const bcrypt =require('bcryptjs');
const jwt=require('jsonwebtoken');
const User =require('../models/User');

//Register Admin
router.post('/register',async(req,res)=>{
    try{
        const {name,email,password}=req.body;

        const existing=await User.findOne({email});
        if(existing)return res.status(400).json({message:"User already exists"});

        const hashed =await bcrypt.hash(password,10);
        const user =new User({name,email,password:hashed});
        await user.save();
        
        res.status(201).json({message:"Admin registered successfully"});
    }catch(err){
        res.status(500).json({message: err.message});
    }
});

//Login
router.post('/login',async(req,res)=>{
    try{
        const {email,password}=req.body;

        const user =await User.findOne({email});
        if(!user) return res.status(400).json({message:"Invalid credentials"});

        const isMatch =await bcrypt.compare(password,user.password);
        if(!isMatch) return res.status(400).json({message:"Invalid credentials"});

        const token =jwt.sign(
            {id:user._id, email:user.email},
            process.env.JWT_SECRET,
            {expiresIn:'7d'}
        );
        res.json({
            token,
            user:{id:user._id,name:user.name,email:user.email}
        });
    }catch(err){
        res.status(500).json({message:err.message});
    }
});
module.exports=router;