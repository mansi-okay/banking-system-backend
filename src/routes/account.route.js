import { Router } from "express";
import {verifyjwt} from "../middlewares/auth.middleware.js";
import { createAccountController } from "../controllers/account.controller.js";

const accountRouter = Router()

/* 
- POST /api/accounts/
- Protected route
*/
accountRouter.route("/").post(verifyjwt,createAccountController)

export {accountRouter}