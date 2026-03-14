import { Account } from "../models/account.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/*
- Account creation controller
- POST /api/accounts/create-account
*/
const createAccountController = asyncHandler(async(req,res) => {
    const user = req.user

    if (!user) {
        throw new ApiError(400, "User does not exist!")
    }

    const account = await Account.create({
        user: user._id
    })

    res.status(200)
    .json(new ApiResponse(201,{account},"Account created successfully"))
})

export {createAccountController}