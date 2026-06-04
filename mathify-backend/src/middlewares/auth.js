
const { ApiError } = require("../utils/ApiError") ;
const { asyncHandler } = require("../utils/AsyncHandler") ;
const jwt = require("jsonwebtoken") ;
const User = require("../models/user.model") ;


 const verifyJWT = asyncHandler(async (req,_,next) => {
    try {
        const authHeader = req.header("Authorization");
        const token = req.cookies?.accessToken || (authHeader ? authHeader.split(" ")[1] : null);
    
        if(!token)
        {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user)
        {
            throw new ApiError(401,"Invalid AcessToken")
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
    }
})

module.exports = {verifyJWT} ;
