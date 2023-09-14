import mongoose from "mongoose";

const studentNotificationUpdateSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "student",
  },
  count: {
    type: Number,
  },
  inView: {
    type: Boolean,
    default: false,
  },
});

const StudentNotificationUpdate = mongoose.model(
  "studentNotificationupdate",
  studentNotificationUpdateSchema
);

export default StudentNotificationUpdate;
