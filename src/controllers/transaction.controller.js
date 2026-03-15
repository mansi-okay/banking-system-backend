import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js";
import { Account } from "../models/account.model.js";
import { Transaction } from "../models/transaction.model.js";

const createTransaction = asyncHandler(async (req,res) => {

    // validate request 

    const {fromAccount,toAccount,amount,idempotencyKey} = req.body

    if (!fromAccount?.trim() || !toAccount?.trim() || !amount?.trim() || !idempotencyKey?.trim()) {
        throw new ApiError(400,"All fields(fromAccount, toAccount, amount and idempotencyKey) are required!")
    }

    const loggedInUser = req.user

    if(!loggedInUser) {
        throw new ApiError(400,"User nor logged in!!")
    }

    const fromUserAccount = await Account.findOne({
        _id: fromAccount,
        user: loggedInUser._id
    })

    if (!fromUserAccount){
        throw new ApiError(400,"fromAccount does not belong to user!!")
    }

    const toUserAccount = await Account.findOne({
        _id: toAccount
    })

    if (!toUserAccount){
        throw new ApiError(400,"Invalid toAccount!!")
    }

    // validate idempotency key 

    const existingTransaction = await Transaction.findOne({idempotencyKey})

    if (existingTransaction){
        if(existingTransaction.status === "COMPLETED"){
            return new ApiResponse(200,{transaction: existingTransaction},"Transaction already processed")
        }
        if(existingTransaction.status === "PENDING"){
            return new ApiResponse(200,{transactionId: existingTransaction._id},"Transaction still processing")
        }
        if(existingTransaction.status === "FAILED"){
            return new ApiResponse(500,{transactionId: existingTransaction._id},"Transaction already failed")
        }
        if(existingTransaction.status === "REVERSED"){
            return new ApiResponse(500,{transactionId: existingTransaction._id},"Transaction reversed")
        }
    }

    // check account status

    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        throw new ApiError(400,"Either fromAccount or toAccount is not ACTIVE!!")
    }

    // derive sender's account balance
 
})