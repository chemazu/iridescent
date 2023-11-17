import mongoose from "mongoose";

const blockedStudentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "student",
    required: true,
  },
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  blockType: {
    type: String,
    required: true,
  },
  visitorID: {
    type: String,
  },
  roomId: {
    type: String,
  },

  blockedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the BlockedStudent model
const BlockedStudent = mongoose.model("blockedStudent", blockedStudentSchema);

export default BlockedStudent;
