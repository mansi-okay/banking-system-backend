import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"
import ApiError from "./ApiError.js"
import bcrypt from "bcrypt"

const genAccessAndRefreshTokens = async(userID) => {
    try {
        const user = await User.findById(userID)

        if (!user) {
            throw new ApiError(400,"User does not exist! ")
        }

        const accessToken = jwt.sign(
            {
                _id:user._id,
                role:user.role
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            }
        )
    
        const refreshToken = jwt.sign(
            {
                _id:user._id
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            }
        )
        
        user.refreshToken = await bcrypt.hash(refreshToken,10)

        await user.save({validateBeforeSave: false})
    
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(400,"Could not generate tokens!")
    }
}

export {genAccessAndRefreshTokens}