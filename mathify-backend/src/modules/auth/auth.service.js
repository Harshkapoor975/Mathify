const User = require("../../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signupService = async (data) => {

    const {
        username,
        fullName ,
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
        fullName ,
        email,
        password,
        rating:1000,
        matchesPlayed:0
    });

    return {
        id:user._id,
        username:user.username,
        email:user.email
    };

};

const loginService = async (data) => {

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

module.exports = {
    signupService,
    loginService
}