"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _mongoosePaginateV = _interopRequireDefault(require("mongoose-paginate-v2"));

var _NotificationUpdate = _interopRequireDefault(require("./NotificationUpdate"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const notificationSchema = new _mongoose.default.Schema({
  user: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "user"
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
});
notificationSchema.post("save", async function (next) {
  const notification = this;
  const notificationUpdateForUser = await _NotificationUpdate.default.findOne({
    user: notification.user
  });

  if (notificationUpdateForUser === null) {
    const newNotificationUpdate = new _NotificationUpdate.default({
      user: notification.user,
      count: 1,
      inView: true
    });
    await newNotificationUpdate.save();
    return;
  }

  notificationUpdateForUser.count = notificationUpdateForUser.count + 1;
  notificationUpdateForUser.inView = true; // controls if it should display counter to user

  await notificationUpdateForUser.save();
});
notificationSchema.post("remove", async function (next) {
  const notification = this;
  const notificationUpdateForUser = await _NotificationUpdate.default.findOne({
    user: notification.user
  });
  notificationUpdateForUser.count = notificationUpdateForUser.count - 1;
  await notificationUpdateForUser.save();
});
notificationSchema.plugin(_mongoosePaginateV.default);

const Notification = _mongoose.default.model("notification", notificationSchema);

var _default = Notification;
exports.default = _default;