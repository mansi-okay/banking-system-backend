import mongoose,{Schema} from "mongoose";

const tokenBlacklistSchema = Schema(
    {
    token: {
        type: String,
        required: [ true, "Token is required to blacklist" ],
        unique: [ true, "Token is already blacklisted" ]
    }
    },{timestamps:true})

tokenBlacklistSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60*60*24*3 }
)

export const TokenBlacklist = mongoose.model("TokenBlacklist",tokenBlacklistSchema)