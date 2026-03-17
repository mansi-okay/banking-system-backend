import jwt from "jsonwebtoken"
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { TokenBlacklist } from "../models/tokenBlacklist.model.js"

const verifyjwt = asyncHandler(async(req,res,next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if (!token){
            throw new ApiError(400,"Unauthorised request!!")
        }

        const tokenBlacklisted = await TokenBlacklist.findOne({ token })

        if(tokenBlacklisted){ throw new ApiError(401,"Access token blacklisted")}
    
        const decodedPayload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        if (!decodedPayload){
            throw new ApiError(400,"Unauthorised request!!")
        }
    
        const user = await User.findById(decodedPayload._id)
    
        if (!user) {
            throw new ApiError(400, "Invalid Access Token!!")
        }
    
        req.user = user
    
        next()
    } catch (error) {
        throw new ApiError(400,error.message)
    }
})

const authorizeRoles = (...allowedRoles) => {
    return (req,res,next) => {
        const loggedInUser = req.user
        if(!loggedInUser){
            throw new ApiError(401,"Unauthorised request!")
        }

        if(!allowedRoles.includes(loggedInUser.role)){
            throw new ApiError(403,"Access denied!")
        }

        next()
    }
}

export {verifyjwt,authorizeRoles}