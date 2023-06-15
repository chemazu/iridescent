import mongoose from "mongoose";

const notesSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    timestamp: {
      type: String,
      required: true,
    },
    createdby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
    },
    courseunit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courseunit",
    },
  },
  { timestamps: true }
);

const Note = mongoose.model("notes", notesSchema);

export default Note;
