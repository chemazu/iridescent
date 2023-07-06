import mongoose from "mongoose";

const tutorSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    avatar: {
      type: String,
    },
  },
  { timestamps: true }
);

const Tutor = mongoose.model("tutor", tutorSchema);

export default Tutor;
