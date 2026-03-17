import { Router } from "express";
import {verifyjwt,authorizeRoles} from "../middlewares/auth.middleware.js";
import {createTransaction,createInitialFundsTransaction} from "../controllers/transaction.controller.js"
import { transactionLimiter } from "../middlewares/rateLimiter.middleware.js";

const transactionRouter = Router()

/*
- POST /api/transactions/
- Create a new transaction
*/
transactionRouter.route("/").post(verifyjwt,transactionLimiter,createTransaction)

/*
- POST /api/transactions/system/initial-funds
- Create initial funds transaction from system user
*/
transactionRouter.route("/system/initial-funds").post(verifyjwt,authorizeRoles("system"),createInitialFundsTransaction)

export {transactionRouter}