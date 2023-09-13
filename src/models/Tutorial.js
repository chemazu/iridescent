import mongoose from "mongoose";

const tutorialSchema = new mongoose.Schema(
  {
    videoUrl: {
      type: String,
    },
    videoId: {
      type: String,
    },
    title: {
      type: String,
    },
    duration: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Tutorial = mongoose.model("tutorial", tutorialSchema);

export default Tutorial;
