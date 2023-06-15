import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
    },
    avatar: {
      type: String,
    },
    password: {
      type: String,
    },
    enrolledTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "school",
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.index({ email: 1 });
studentSchema.index({ username: 1 });

const Student = mongoose.model("student", studentSchema);

export default Student;
