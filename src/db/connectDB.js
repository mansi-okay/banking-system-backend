import mongoose from "mongoose";

const connectDB = async(req,res) => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URL)
        console.log(`DB connected successfully. Host: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log(`DB connection failed! ERROR: ${error.code}`);
        process.exit(1)
    }
}

export default connectDB