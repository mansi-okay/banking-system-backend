import { Account } from "../models/account.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/*
- Account creation controller
- POST /api/accounts/
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

/*
- controller to fetch all accounts of a logged in user
- GET /api/accounts/
*/

const getUserAccounts = asyncHandler(async(req,res) => {
    const loggedInUser = req.user 

    if(!loggedInUser){
        throw new ApiError(400,"User not logged in")
    }

    const accountData = await Account.find({user:loggedInUser._id})

    res.status(200)
    .json(new ApiResponse(200,{userAccounts: accountData},"Accounts of users fetched sccessfully"))
})

/*
- controller to fetch the account balance
- GET /api/accounts/balance/:accountId
*/
const getAccountBalance = asyncHandler(async(req,res) => {
    const {accountId} = req.params

    const loggedInUser = req.user

    if(!loggedInUser){
        throw new ApiError(400,"User not logged in")
    }

    const userAccount = await Account.findOne({_id:accountId,user:req.user._id})

    if (!userAccount){throw new ApiError(400,"User account does not exist")}

    const accountBalance = await userAccount.getBalance()

    res.status(200)
    .json(new ApiResponse(200,
        {
            accountId: userAccount._id,
            accountBalance
        }, "Account balance fetched successfully"))
})

export {createAccountController,getUserAccounts,getAccountBalance}