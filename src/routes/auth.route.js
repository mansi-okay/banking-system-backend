import { Router } from "express";
import {userRegisterController} from "../controllers/auth.controller.js"

const authRouter = Router()

authRouter.route("/register").post(userRegisterController)

export {authRouter}