import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = Schema(
    {
        name: {
            type: String,
            required:[true, "Name is required field!"]
        },
        email: {
            type:String,
            required:[true,"Email is required field!"],
            trim:true,
            lowercase:true,
            match: [ /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email address!"],
            unique: [true, "Email already exists!"]
        },
        password: {
            type:String,
            required:[true, "Password is required field!"],
            minlength:[8,"Password should have atleast 8 characters"],
            select:false
        },
        role: {
            type:String,
            enum: ["user","admin","system"],
            default: "user",
            immutable: true
        },
        refreshToken: {
            type:String,
            select:false
        }
    },
    {
        timestamps:true
    }
)

userSchema.pre("save", async function() {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password,10)
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password,this.password)
}

export const User = mongoose.model("User",userSchema)