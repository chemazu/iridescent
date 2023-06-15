import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: false,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  thumbnail: {
    type: String,
    required: false,
  },
  file: {
    type: String,
    required: false,
  },
  file_public_id: {
    type: String,
  },
  published: {
    type: Boolean,
    default: false,
  },
  productdiscount: {
    type: String,
  },
  productthumbnailid: {
    type: String,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  verification_in_review: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: "product",
  },
  tutor: {
    // the tutor property is what we use to keep track of tutuors who create courses for the
    // courses.tuturly account
    type: mongoose.Schema.Types.ObjectId,
    ref: "tutor",
  },
  reviews: [
    {
      name: {
        type: String,
      },
      email: {
        // email added to keep track of user's who have already added reviews.
        //  even though it won't be displayed
        type: String,
      },
      star: {
        type: Number,
        default: 0,
      },
      comment: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  file_size: {
    type: Number,
  },
  file_type: {
    type: String,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "school",
  },
});
const Product = mongoose.model("Product", productSchema);
export default Product;
