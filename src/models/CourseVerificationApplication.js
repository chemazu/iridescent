import mongoose from "mongoose";

const courseVerificationApplicationSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
    },
    title: {
      type: String,
    },
    course_author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    verified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const CourseVerificationApplication = mongoose.model(
  "courseverificationapplication",
  courseVerificationApplicationSchema
);

export default CourseVerificationApplication;
