import mongoose from "mongoose";

const courseChapterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    courseunit: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courseunit",
      },
    ],
  },
  {
    timestamps: true,
  }
);

courseChapterSchema.index({ author: 1 });

const CourseChapter = mongoose.model("coursechapter", courseChapterSchema);

export default CourseChapter;
