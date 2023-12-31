import mongoose from "mongoose";

const paymentPlansSchema = new mongoose.Schema(
  {
    planname: {
      type: String,
    },
    coursecount: {
      type: Number,
    },
    productcount: {
      type: Number,
    },
    percentchargepercoursesale: {
      type: Number,
    },
    planprice: {
      type: Number,
    },
    planprice_usd: {
      type: Number,
    },
    plandiscountprice_usd: {
      type: Number,
    },
    totaluploadsize: {
      // saved in MB(megabytes)
      type: Number,
    },
    studentsize: {
      type: String,
    },
    videouploadsize: {
      // saved in MB(megabytes)
      type: Number,
    },
    instantpayout: {
      type: Boolean,
    },
    productsupport: {
      type: Boolean,
    },
    coursedesigntemplate: {
      type: Boolean,
    },
    paystackplancode: {
      type: String,
    },
    stripe_plan_code: {
      type: String,
    },
  },
  { timestamps: true }
);

const PaymentPlans = mongoose.model("paymentplans", paymentPlansSchema);

export default PaymentPlans;
