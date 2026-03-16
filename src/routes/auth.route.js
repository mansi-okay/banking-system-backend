import { Router } from "express";
import {userRegisterController,loginController} from "../controllers/auth.controller.js"

const authRouter = Router()

/* POST /api/auth/register */
authRouter.route("/register").post(userRegisterController)

/* POST /api/auth/log-in */
authRouter.route("/log-in").post(loginController)

export {authRouter}