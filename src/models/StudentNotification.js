import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import StudentNotificationUpdate from "./StudentNotificationUpdate";

const studentNotificationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
    },
    title: {
      type: String,
    },
    message: {
      type: String,
    },
    type: {
      type: String,
    },
    isSeen: {
      type: Boolean,
      default: false,
    },
    coursechapterid: {
      type: mongoose.Schema.Types.ObjectId,
    },
    courseunitid: {
      type: mongoose.Schema.Types.ObjectId,
    },
    commentid: {
      type: mongoose.Schema.Types.ObjectId,
    },
    replyid: {
      type: mongoose.Schema.Types.ObjectId,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

studentNotificationSchema.post("save", async function (next) {
  const studentNotification = this;

  const notificationUpdateForStudent = await StudentNotificationUpdate.findOne({
    student: studentNotification.student,
  });

  if (notificationUpdateForStudent === null) {
    const newStudentNotificationUpdate = new StudentNotificationUpdate({
      student: studentNotification.student,
      count: 1,
      inView: true,
    });

    await newStudentNotificationUpdate.save();
    return;
  }

  notificationUpdateForStudent.count = notificationUpdateForStudent.count + 1;
  notificationUpdateForStudent.inView = true; // controls if it should display counter to user
  await notificationUpdateForStudent.save();
});

studentNotificationSchema.post("remove", async function (next) {
  const studentNotification = this;

  const notificationUpdateForStudent = await StudentNotificationUpdate.findOne({
    student: studentNotification.student,
  });

  notificationUpdateForStudent.count = notificationUpdateForStudent.count - 1;
  await notificationUpdateForStudent.save();
});

studentNotificationSchema.plugin(mongoosePaginate);

const StudentNotification = mongoose.model(
  "studentNotification",
  studentNotificationSchema
);

export default StudentNotification;
