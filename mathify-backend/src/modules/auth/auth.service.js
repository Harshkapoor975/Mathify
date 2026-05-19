import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signupService = async (data) => {

    const {
        username,
        email,
        password
    } = data;

    if(!username || !email || !password){
        throw new Error("All fields required");
    }

    const existingUser = await User.findOne({email});

    if(existingUser){
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password,10);

    const user = await User.create({
        username,
        email,
        password:hashedPassword,
        rating:1000,
        matchesPlayed:0
    });

    return {
        id:user._id,
        username:user.username,
        email:user.email
    };

};

export const loginService = async (data) => {

    const {
        email,
        password
    } = data;

    if(!email || !password){
        throw new Error("All fields required");
    }

    const user = await User.findOne({email});

    if(!user){
        throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(
        password,
        user.password
    );

    if(!isMatch){
        throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
        {
            id:user._id,
            username:user.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn:"7d"
        }
    );

    return {
        token,
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    };

};