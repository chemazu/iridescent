import mongoose from "mongoose";

const addResourceSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
    },
    orderfrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    added: {
      type: Number,
    },

    amount: {
      type: Number,
    },
    ordertype: {
      type: String,
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

const AddResource = mongoose.model("addResource", addResourceSchema);

export default AddResource;
