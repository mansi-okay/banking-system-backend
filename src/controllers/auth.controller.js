import ApiResponse from "../utils/ApiResponse.js"
import ApiError from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import {genAccessAndRefreshTokens} from "../utils/generateTokens.js"
import { registrationMail } from "../services/email.service.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { TokenBlacklist } from "../models/tokenBlacklist.model.js"

/*
- user register controller
- POST /api/auth/register
*/
const userRegisterController = asyncHandler(async(req,res) => {
    const {name,email,password} = req.body

    if (!name?.trim() || !email?.trim() || !password?.trim()){
        throw new ApiError(400, "Missing fields")
    }

    if (password.length < 8){
        throw new ApiError(400, "Password should have atleast 8 characters")
    }

    const existingUser = await User.findOne({email})

    if (existingUser) {
        throw new ApiError(400,"User already exists!")
    }

    const user = await User.create(
        {
            name,email,password,role:"user"      
        }
    )

    await registrationMail(user.email,user.name)

    const {accessToken,refreshToken} = await genAccessAndRefreshTokens(user._id)

    const options = {
        httpOnly:true,
        secure:true,
        sameSite:"strict",
        maxAge:7*24*60*60*1000
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200, 
        {
            user : {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        },
        "User created successfully"
    )
)
})

/*
- user login controller
- POST /api/auth/log-in
*/
const loginController = asyncHandler(async (req,res) => {
    const {email,password} = req.body

    if (!email?.trim() || !password?.trim()) {
        throw new ApiError(400,"All fields required!")
    }

    const user = await User.findOne({email:email.toLowerCase()}).select("+password")

    if (!user) {throw new ApiError(400, "Email or password is INVALID!")}

    const passwordMatch = await user.isPasswordCorrect(password)

    if (!passwordMatch) {throw new ApiError(400,"Email or password is INVALID!")}

    const {accessToken,refreshToken} = await genAccessAndRefreshTokens(user._id)

    const options = {
        httpOnly:true,
        secure:true,
        sameSite:"strict",
        maxAge:7*24*60*60*1000
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,
        {
            user : {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }            
        },
        "User logged-in successfully"
    ))
})

/* 
- controller for refresh token rotation
- POST /api/auth/refresh-token 
*/
const refreshAccessToken = asyncHandler(async(req,res) => {
    const fetchedRefreshToken = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!fetchedRefreshToken){throw new ApiError(401,"Unauthorised request!")}

    try {
        const decodedPayload = jwt.verify(fetchedRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        if(!decodedPayload){ throw new ApiError(400, "Invalid refresh token")}

        const user = await User.findById(decodedPayload._id).select("+refreshToken")
        if(!user){ throw new ApiError(401, "Invalid refresh token")}


        const validToken = await bcrypt.compare(
            fetchedRefreshToken,
            user.refreshToken
        )

        if (!validToken){
            throw new ApiError(400,"Refresh token expired")
        }

        const options = {
            httpOnly:true,
            secure:true,
            sameSite:"strict",
            maxAge:7*24*60*60*1000
        }

        const {accessToken,refreshToken:newRefreshToken} = await genAccessAndRefreshTokens(user._id)

        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(200, {accessToken, newRefreshToken},"Access token refreshed")
        )

    } catch (error) {
        throw new ApiError(400, error?.message)
    }
})

/* 
- Controller for logging out user and blacklist access token
- POST /api/auth/log-out 
*/
const logOut = asyncHandler(async(req,res) => {
    const fetchedAccessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!fetchedAccessToken){throw new ApiError(400,"User logged out")}

    await TokenBlacklist.create({token:fetchedAccessToken})

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {refreshToken: 1 }
        }
    )

    const options = {
        httpOnly:true,
        secure:true,
        sameSite:"strict"
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

export {userRegisterController,loginController,refreshAccessToken,logOut}