import mongoose from "mongoose";

const InternationalBankdetailsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    accountCurrencyType: {
      // as either USD, GBP, or EUR
      type: String,
    },
    accountspecificationtype: {
      // can take the form of aba for ACH accounts, swift for swift based account, iban for euro and iban based account
      type: String,
    },
    accountholdername: {
      type: String,
    },
    accountnumber: {
      type: String,
    },
    legaltype: {
      type: String,
    },
    swiftcode: {
      type: String,
    },
    routingcode: {
      type: String,
    },
    accounttype: {
      // account type for ACH based account
      type: String, // possible values could be CHECKING or SAVINGS
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    postcode: {
      type: String,
    },
    firstline: {
      type: String,
    },
    wise_account_id: {
      type: String,
    },
  },
  { timestamps: true }
);

const InternationalBankDetails = mongoose.model(
  "internationalbankdetails",
  InternationalBankdetailsSchema
);

export default InternationalBankDetails;
