import cookieParser from "cookie-parser"
import express from "express"

const app = express()

app.use(express.json())
app.use(cookieParser())

import {authRouter} from "./routes/auth.route.js"

app.use("/api/auth",authRouter)

export default app