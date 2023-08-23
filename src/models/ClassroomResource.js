import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
});

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [],
    required: true,
  },
});

const classroomResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // Assuming the reference model is named "User"
      required: true,
    },
    persist: {
      type: Boolean,
      required: true,
      default: false,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "school", // Assuming the reference model is named "School"
    },
    type: {
      type: String,
      required: true,
    },
    timeStamp: {
      type: Date,
      required: true,
    },
    durationInSec: {
      type: Number,
    },
    quizHolder: {
      type: [questionSchema], // For "quiz" type
    },
    options: {
      type: [], // For "poll" type
    },
    answers: {
      type: [], // For "quiz" type
    },
  },
  { timestamps: true }
);

const ClassroomResource = mongoose.model(
  "ClassroomResource",
  classroomResourceSchema
);

export default ClassroomResource;
