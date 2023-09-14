import mongoose from "mongoose";

const BankdetailsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    bankname: {
      type: String,
    },
    accountnumber: {
      type: String,
    },
    accountname: {
      type: String,
    },
    bankcode: {
      type: String,
    },
  },
  { timestamps: true }
);

const Bankdetails = mongoose.model("bankdetails", BankdetailsSchema);

export default Bankdetails;
