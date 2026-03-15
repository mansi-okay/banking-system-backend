import mongoose,{Schema} from "mongoose";

const transactionSchema = new Schema(
    {
        fromAccount: {
            type: Schema.Types.ObjectId,
            ref: "Account",
            required: [true, "Transaction must be assoosiated with a from account"],
            index:true
        },
        toAccount: {
            type: Schema.Types.ObjectId,
            ref: "Account",
            required: [true, "Transaction must be assoosiated with a to account"],
            index:true
        },
        amount: {
            type: Number,
            required:[true,"Amount is a required field"],
            min: [0,"Amount can not be negative"]
        },
        status: {
            type: String,
            enum: {
                values :["PENDING","COMPLETED","FAILED","REVERSED"],
                message: "Status can be either PENDING, COMPLETED, FAILED or REVERSED"
            },
            default: "PENDING"
        },
        idempotencyKey: {
            type:String,
            required:[true,"Idempotency key is required field"],
            unique:true,
            index:true
        }
    },
    {timestamps:true}
)

export const Transaction = mongoose.model("Transaction",transactionSchema)