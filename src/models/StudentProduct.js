import mongoose from "mongoose";

const studentProductSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
    },
    productBought: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
    boughtfrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "school",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

studentProductSchema.index({ student: 1, productBought: 1 }, { unique: true });

const StudentProduct = mongoose.model("studentProduct", studentProductSchema);

export default StudentProduct;
