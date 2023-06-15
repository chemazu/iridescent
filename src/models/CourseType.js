import mongoose from "mongoose";

const courseTypeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    rootcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "rootcategory",
    },
  },
  { timestamps: true }
);

const CourseType = mongoose.model("courseType", courseTypeSchema);

export default CourseType;
