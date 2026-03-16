import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js";
import { Account } from "../models/account.model.js";
import { Transaction } from "../models/transaction.model.js";
import mongoose from "mongoose";
import { Ledger } from "../models/ledger.model.js";
import { transactionMail } from "../services/email.service.js";

/*
- transaction creation controller
- POST /api/transactions/create-transaction
*/
const createTransaction = asyncHandler(async (req,res) => {

    // validate request 
    const {fromAccount,toAccount,amount,idempotencyKey} = req.body

    if (!fromAccount?.trim() || !toAccount?.trim() || !amount?.toString().trim() || !idempotencyKey?.trim()) {
        throw new ApiError(400,"All fields(fromAccount, toAccount, amount and idempotencyKey) are required!")
    }

    if (fromAccount.toString() === toAccount.toString()) {
        throw new ApiError(400, "Self transfer is not allowed")
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
        switch(existingTransaction.status){
            case "COMPLETED":
                return res.status(200).json(
                new ApiResponse(200,{transaction: existingTransaction},"Transaction already processed")
            )
            case "PENDING":
                return res.status(200).json(
                new ApiResponse(200,{transactionId: existingTransaction._id},"Transaction still processing")
            )
            case "FAILED":
                return res.status(500).json(
                new ApiResponse(500,{transactionId: existingTransaction._id},"Transaction already failed")
            )
            case "REVERSED":
                return res.status(500).json(
                new ApiResponse(500,{transactionId: existingTransaction._id},"Transaction reversed")
            )
        }
    }

    // check account status
    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        throw new ApiError(400,"Either fromAccount or toAccount is not ACTIVE!!")
    }

    // derive sender's account balance
    const sendersBalance = fromUserAccount.getBalance()

    if (sendersBalance<amount){
        throw new ApiError(400,"Sender's balance is insufficient")
    }

    // start mongo db session
    const session = await mongoose.startSession()
    session.startTransaction()

    let transaction;

    try {
        // create transaction (PENDING default)
        transaction = await Transaction.create({
            fromAccount:fromUserAccount._id,
            toAccount:toUserAccount._id,
            amount,
            idempotencyKey
        }, {session})

        // create debit ledger 
        const debitLedgerEntry = await Ledger.create({
            account:fromUserAccount._id,
            transaction:transaction._id,
            amount,
            type:"DEBIT"
        },{session})

        // create credit ledger 
        const creditLedgerEntry = await Ledger.create({
            account:toUserAccount._id,
            transaction:transaction._id,
            amount,
            type:"CREDIT"
        },{session})

        // mark transaction COMPLETED
        await Transaction.findOneAndUpdate(
            {_id:transaction._id},
            {status:"COMPLETED"},
            {session}
        )

        // commit mongo db session
        await session.commitTransaction()
        session.endSession()
        
    } catch (error) {
        await session.abortTransaction()
        session.endSession()

        await transactionFailureMail(loggedInUser.email,loggedInUser.name,amount,toAccount)
        throw error
    }

    await transactionMail(loggedInUser.email,loggedInUser.name,amount,toAccount)

    return res.status(200)
    .json(new ApiResponse(200,{transaction},"Transactin completed successfully"))
 
})

const createInitialFundsTransaction = asyncHandler(async(req,res) => {
    const {toAccount,amount,idempotencyKey} = req.body

    if (!toAccount?.trim() || !amount?.toString().trim() || !idempotencyKey?.trim()) {
        throw new ApiError(400,"All fields(toAccount, amount and idempotencyKey) are required!")
    }

    const toUserAccount = await Account.findOne({_id:toAccount})

    if(!toUserAccount){
        throw new ApiError(400,"To user account invalid!")
    }

    const fromUserAccount = await Account.findOne(
        {user:req.user?._id}
    )

    if(!fromUserAccount){
        throw new ApiError(400,"System user account not found")
    }

    const session = await mongoose.startSession()
    await session.startTransaction()

    try {
        const transaction = new Transaction(
            {
                fromAccount:fromUserAccount._id,
                toAccount:toUserAccount._id,
                amount,
                idempotencyKey,
                status:"PENDING"
            }
        )

        await transaction.save({ session })

        const debitLedgerEntry = await Ledger.create([{
            account:fromUserAccount._id,
            transaction:transaction._id,
            amount,
            type:"DEBIT"
        }],{session})

        const creditLedgerEntry = await Ledger.create([{
            account:toUserAccount._id,
            transaction:transaction._id,
            amount,
            type:"CREDIT"
        }],{session})

        transaction.status = "COMPLETED"
        const transactionData = await transaction.save({session})

        await session.commitTransaction()
        session.endSession()

        return res.status(200)
        .json(new ApiResponse(200,{transaction:transactionData},"Initial funds transaction completed successfully"))

    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
    }

})

export {createTransaction,createInitialFundsTransaction}