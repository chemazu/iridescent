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
    actualPayout: {
      type: Number,
    },
    status: {
      type: String,
    },
    transferrecipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bankdetails",
    },
    transferreference: {
      type: String,
    },
    recipientcode: {
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
