import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
    },
    boughtfrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    orderfrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
    },
    orderedcourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
    },
    tutor: {
      // the tutor property is what we use to keep track of tutuors who's courses or products we're purchased
      // courses.tuturly account
      type: mongoose.Schema.Types.ObjectId,
      ref: "tutor",
    },
    createdVia: {
      type: String,
      enum: ["callback", "webhook"],
    },
    amount: {
      type: Number,
    },
    ordertype: {
      type: String,
    },
    actualearning: {
      type: Number,
    },
    orderdate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ reference: 1 });
orderSchema.index({ boughtfrom: 1 });
orderSchema.index({ orderdate: 1 });
orderSchema.index({ boughtfrom: 1, orderdate: 1 });

const Order = mongoose.model("order", orderSchema);

export default Order;
