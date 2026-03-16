import { Router } from "express";
import {verifyjwt} from "../middlewares/auth.middleware.js";
import { createAccountController,getUserAccounts,getAccountBalance } from "../controllers/account.controller.js";

const accountRouter = Router()

/* 
- POST /api/accounts/
- Protected route
*/
accountRouter.route("/").post(verifyjwt,createAccountController)

/*
- GET /api/accounts/
- Fetch all accounts of a logged in user
*/
accountRouter.route("/").get(verifyjwt,getUserAccounts)

/*
- GET /api/accounts/balance/:accountId
- fetch the account balance
*/
accountRouter.route("/balance/:accountId").get(verifyjwt,getAccountBalance)

export {accountRouter}