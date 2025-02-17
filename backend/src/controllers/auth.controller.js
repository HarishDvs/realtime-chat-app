import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js"

import bcrypt from "bcrypt"

export const signup = async (req,res)=>{
    const {fullName,email,password} = req.body
    try {
        //hashing passwords

        if(!fullName || !email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }
        if (password.length < 6) {
            return res.status(400).json({message: "Password must be at least 6 characters"});
        }
      
      
        const user = await User.findOne({email})

        if (user) return res.status(400).json({message: "Email already exists"});
    
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullName,
            email,
            password:hashedPassword
        })

        if(newUser) {
            //create jwt token
            generateToken(newUser._id,res)
            await newUser.save();
            

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        }
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({message: "Internal Server Error"});

        
    }
};

export const login = async (req,res)=>{
    const {email, password} = req.body
 try{
    const user = await User.findOne({email})

    if(!user) {
        return res.status(400).json({message:"Invalid credentials"})
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if(!isPasswordCorrect) {
        return res.status(400).json({ message : "Invalid credentials"});
    }

    generateToken(user._id,res)

    res.status(200).json({
        _id:user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        
    })
   
   } catch (error) {

   } 

};

export const logout = (req,res)=>{
    res.send("logout route");
};
