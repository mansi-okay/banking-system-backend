import {setServers} from "node:dns/promises"
setServers(["8.8.8.8","1.1.1.1"])
import dotenv from "dotenv"
dotenv.config()
import connectDB from "./db/connectDB.js"
import app from "./app.js"

connectDB()
.then((res) => {
    app.listen(process.env.PORT, ()=> {
        console.log(`Server running on port: ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log(`DB connection failed: ${error.message}`);
})