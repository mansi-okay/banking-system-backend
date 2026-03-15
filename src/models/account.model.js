import mongoose,{Schema} from "mongoose";

const accountSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref:"User",
            required: [true, "Account must be linked to a user"],
            index:true
        },
        status: {
            type:String,
            enum: {
                values: ["ACTIVE", "FROZEN","CLOSED"],
                message: "Status can be either ACTIVE, FROZEN or CLOSED"
            },
            default: "ACTIVE"            
        },
        currency: {
            type:String,
            enum: ["INR", "USD", "EUR"],
            default:"INR"
        }
    },
    {timestamps:true}
)

accountSchema.index({user:1,status:1})

export const Account = mongoose.model("Account",accountSchema)