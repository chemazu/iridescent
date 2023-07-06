import mongoose from "mongoose";

const productTypeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

const ProductType = mongoose.model("productType", productTypeSchema);

export default ProductType;
