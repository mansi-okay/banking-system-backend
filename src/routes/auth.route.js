import { Router } from "express";
import {userRegisterController,loginController,refreshAccessToken} from "../controllers/auth.controller.js"
import { verifyjwt } from "../middlewares/auth.middleware.js";

const authRouter = Router()

/* POST /api/auth/register */
authRouter.route("/register").post(userRegisterController)

/* POST /api/auth/log-in */
authRouter.route("/log-in").post(loginController)

/* 
- POST /api/auth/refresh-token 
- Refresh token rotation
*/
authRouter.route("/refresh-token").post(refreshAccessToken)

export {authRouter}