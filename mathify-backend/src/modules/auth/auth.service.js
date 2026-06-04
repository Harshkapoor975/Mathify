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

    const user = await User.create({
        username,
        fullName,
        email,
        password,
        rating: 1000,
        wins: 0,
        losses: 0
    });

    // Generate token after signup
    const token = jwt.sign(
        {
            _id: user._id,
            username: user.username,
            email: user.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "7d"
        }
    );

    return {
        token,
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            rating: user.rating,
            wins: user.wins,
            losses: user.losses
        }
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
            _id: user._id,
            username: user.username,
            email: user.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "7d"
        }
    );

    return {
        token,
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            rating: user.rating,
            wins: user.wins,
            losses: user.losses
        }
    };

};

module.exports = {
    signupService,
    loginService
}