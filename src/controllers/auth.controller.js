import ApiResponse from "../utils/ApiResponse.js"
import ApiError from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import {genAccessAndRefreshTokens} from "../utils/generateTokens.js"
import { registrationMail } from "../services/email.service.js"

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

export {userRegisterController,loginController}