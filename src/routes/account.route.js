import { Router } from "express";
import verifyjwt from "../middlewares/auth.middleware.js";
import { createAccountController } from "../controllers/account.controller.js";

const accountRouter = Router()

/* 
- POST /api/accounts/create-account 
- Protected route
*/
accountRouter.route("/create-account").post(verifyjwt,createAccountController)

export {accountRouter}