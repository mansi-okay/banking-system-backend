import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const seedUsers = asyncHandler(async(req,res) => {
    const systemUser = await User.findOne({ role: "system" })
    const adminUser = await User.findOne({ role: "admin" })

    if (!systemUser) {
        await User.create({
            name: "SYSTEM",
            email: process.env.SYSTEM_EMAIL,
            password: process.env.SYSTEM_PASSWORD,
            role: "system"
        })
        console.log("System user created")
    }
    if (!adminUser) {
        await User.create({
            name: "ADMIN",
            email: process.env.ADMIN_EMAIL,
            password:process.env.ADMIN_PASSWORD,
            role: "admin"
        })
        console.log("Admin user created")
    }
})

export {seedUsers}