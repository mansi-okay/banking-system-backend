import mongoose,{Schema} from "mongoose";
import ApiError from "../utils/ApiError.js"

const ledgerSchema = new Schema(
    {
        account :{
            type:Schema.Types.ObjectId,
            ref: "Account",
            required: [true, "Ledger must be assosiated to an account"],
            index:true,
            immutable: true
        },
        transaction: {
            type:Schema.Types.ObjectId,
            ref: "Transaction",
            required:[true,"Transaction id required for creating Ledger"],
            index:true,
            immutable: true
        },
        amount: {
            type: Number,
            required:[true, "Amount is required for creating a ledger"],
            min: [1,"Amount can not be negative"],
            immutable: true
        },
        type: {
            type:String,
            enum: {
                values: ["CREDIT","DEBIT"],
                message:"Type of ledger can be either CREDIT or DEBIT"
            },
            immutable: true
        }

    },{timestamps:true}
)

const preventLedgerModification = () => {
    throw new ApiError(400, "Ledger entries are immutable and can't be deleted or modified")
}

ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('findOneAndReplace', preventLedgerModification);

export const Ledger = mongoose.model("Ledger",ledgerSchema)