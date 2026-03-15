import { Router } from "express";
import verifyjwt from "../middlewares/auth.middleware.js";
import {createTransaction} from "../controllers/transaction.controller.js"

const transactionRouter = Router()

/*
- POST /api/transactions/create-transaction
- Create a new transaction
*/
transactionRouter.route("create-transaction").post(verifyjwt,createTransaction)

export {transactionRouter}