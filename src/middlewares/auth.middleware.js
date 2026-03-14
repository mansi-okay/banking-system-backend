import jwt from "jsonwebtoken"
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.model.js"

const verifyjwt = asyncHandler(async(req,res,next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if (!token){
            throw new ApiError(400,"Unauthorised request!!")
        }
    
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

export default verifyjwt