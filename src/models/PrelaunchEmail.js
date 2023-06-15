import mongoose from "mongoose";

const PrelaunchEmailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

PrelaunchEmailSchema.index({ email: 1 });

const PrelaunchEmail = mongoose.model("prelaunchemail", PrelaunchEmailSchema);

export default PrelaunchEmail;
