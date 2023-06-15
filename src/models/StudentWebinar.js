import mongoose from "mongoose";

const studentWebinarSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
    },
    webinarBought: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveWebinar",
    },
    boughtfrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "school",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

studentWebinarSchema.index({ student: 1, productBought: 1 }, { unique: true });

const StudentWebinar = mongoose.model("studentWebinar", studentWebinarSchema);

export default StudentWebinar;
