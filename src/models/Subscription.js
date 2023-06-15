import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    subscription_plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "paymentplans",
    },
    amount: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ subscription_plan: 1 });

const Subscription = mongoose.model("subscription", subscriptionSchema);
export default Subscription;
