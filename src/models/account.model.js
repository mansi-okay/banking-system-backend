import mongoose,{Schema} from "mongoose";
import { Ledger } from "./ledger.model.js";

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

accountSchema.methods.getBalance = async function(){

    const balanceData = await Ledger.aggregate([
        {
            $match: {
                account:this._id
            }
        },
        {
            $group: {
                _id:this._id,
                totalCredit: {
                    $sum: {
                        $cond: {
                            if: { $eq : ["$type","CREDIT"]},
                            then: "$amount",
                            else: 0
                        }
                    }
                },
                totalDebit: {
                    $sum: {
                        $cond: {
                            if: { $eq : ["$type","DEBIT"]},
                            then: "$amount",
                            else: 0
                        }
                    }
                }
            }
        },
        {
            $project: {
                _id:0,
                balance: {
                    $subtract: ["$totalCredit", "$totalDebit"]
                }
            }
        }
    ])

    if (balanceData.length === 0) {
        return 0
    }

    return balanceData[0].balance
}

export const Account = mongoose.model("Account",accountSchema)