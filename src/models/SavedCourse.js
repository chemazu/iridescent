import mongoose from "mongoose";

const savedCourseSchema = new mongoose.Schema(
  {
    savedby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
    },
    savedfrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "school",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
    },
  },
  { timestamps: true }
);

const SavedCourse = mongoose.model("savedcourse", savedCourseSchema);

export default SavedCourse;
