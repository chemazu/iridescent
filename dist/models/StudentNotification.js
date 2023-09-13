"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _mongoosePaginateV = _interopRequireDefault(require("mongoose-paginate-v2"));

var _StudentNotificationUpdate = _interopRequireDefault(require("./StudentNotificationUpdate"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const studentNotificationSchema = new _mongoose.default.Schema({
  student: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "student"
  },
  title: {
    type: String
  },
  message: {
    type: String
  },
  type: {
    type: String
  },
  isSeen: {
    type: Boolean,
    default: false
  },
  coursechapterid: {
    type: _mongoose.default.Schema.Types.ObjectId
  },
  courseunitid: {
    type: _mongoose.default.Schema.Types.ObjectId
  },
  commentid: {
    type: _mongoose.default.Schema.Types.ObjectId
  },
  replyid: {
    type: _mongoose.default.Schema.Types.ObjectId
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});
studentNotificationSchema.post("save", async function (next) {
  const studentNotification = this;
  const notificationUpdateForStudent = await _StudentNotificationUpdate.default.findOne({
    student: studentNotification.student
  });

  if (notificationUpdateForStudent === null) {
    const newStudentNotificationUpdate = new _StudentNotificationUpdate.default({
      student: studentNotification.student,
      count: 1,
      inView: true
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
  const notificationUpdateForStudent = await _StudentNotificationUpdate.default.findOne({
    student: studentNotification.student
  });
  notificationUpdateForStudent.count = notificationUpdateForStudent.count - 1;
  await notificationUpdateForStudent.save();
});
studentNotificationSchema.plugin(_mongoosePaginateV.default);

const StudentNotification = _mongoose.default.model("studentNotification", studentNotificationSchema);

var _default = StudentNotification;
exports.default = _default;