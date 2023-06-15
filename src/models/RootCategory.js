import mongoose from "mongoose";

const rootCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);
const RootCategory = mongoose.model("rootCategory", rootCategorySchema);

export default RootCategory;
