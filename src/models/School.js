import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    about: {
      type: String,
    },
    themename: {
      type: String,
    },
    themepreviewid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "themepreview",
    },
    testimonials: [
      {
        testifiedby: {
          type: String,
        },
        testifiertext: {
          type: String,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course",
      },
    ],
    erolledstudent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "student",
      },
    ],
  },
  { timestamps: true }
);

const School = mongoose.model("school", schoolSchema);

export default School;
