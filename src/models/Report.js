import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "school",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
    },
    courseunitid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courseunit",
    },
    tutuor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
    },
    reason: {
      type: String,
      required: true,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("report", reportSchema);

export default Report;
