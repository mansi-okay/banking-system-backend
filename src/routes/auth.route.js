import { Router } from "express";
import {userRegisterController,loginController,refreshAccessToken,logOut} from "../controllers/auth.controller.js"
import { verifyjwt } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";

const authRouter = Router()

/* POST /api/auth/register */
authRouter.route("/register").post(authLimiter,userRegisterController)

/* POST /api/auth/log-in */
authRouter.route("/log-in").post(authLimiter,loginController)

/* 
- POST /api/auth/refresh-token 
- Refresh token rotation
*/
authRouter.route("/refresh-token").post(refreshAccessToken)

/* 
- POST /api/auth/log-out 
*/
authRouter.route("/log-out").post(verifyjwt,logOut)

export {authRouter}