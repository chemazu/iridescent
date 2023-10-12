import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    amount: {
      type: Number,
    },
    amount_usd: {
      type: Number,
    },
    actualPayout: {
      type: Number,
    },
    actualPayout_usd: {
      type: Number,
    },
    withdrawal_currency_type: {
      type: String,
    },
    transaction_type: {
      // can only have one of 2 values "local" or "foreign"
      type: String,
    },
    status: {
      type: String,
    },
    wise_transfer_id: {
      type: String,
    },
    transferrecipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bankdetails",
    },
    bankaccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "internationalbankdetails",
    },
    transferreference: {
      type: String,
    },
    recipientcode: {
      type: String,
    },
    transactionid: {
      type: String,
    },
    quoteid: {
      type: String,
    },
    withdrawaldate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Wallet = mongoose.model("wallet", walletSchema);

export default Wallet;
