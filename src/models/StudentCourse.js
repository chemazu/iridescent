import mongoose from "mongoose";

const studentCourseSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
    },
    coursebought: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
    },
    boughtfrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "school",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    coursemoduleinview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "coursechapter",
      default: null,
    },
    courseunitlastviewed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courseunit",
      default: null,
    },
    unitprogresstimestamp: {
      type: String,
      default: "0",
    },
  },
  { timestamps: true }
);

studentCourseSchema.index({ student: 1, coursebought: 1 }, { unique: true });

const StudentCourse = mongoose.model("studentcourse", studentCourseSchema);

export default StudentCourse;
