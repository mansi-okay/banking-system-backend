import cookieParser from "cookie-parser"
import express from "express"

const app = express()

app.use(express.json())
app.use(cookieParser())

/*
 -Routes required
*/
import {authRouter} from "./routes/auth.route.js"
import { accountRouter } from "./routes/account.route.js"
import { transactionRouter } from "./routes/transaction.route.js"

/*
 -Use Routes
*/
app.use("/api/auth",authRouter)
app.use("/api/accounts",accountRouter)
app.use("/api/transactions",transactionRouter)

export default app