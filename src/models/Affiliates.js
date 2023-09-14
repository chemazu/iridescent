import mongoose from "mongoose";

const affiliateSchema = new mongoose.Schema(
  {
    code_name: {
      type: String,
      unique: true,
    },
    username: {
      type: String,
    },
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    email: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

const Affiliate = mongoose.model("affiliate", affiliateSchema);

export default Affiliate;
