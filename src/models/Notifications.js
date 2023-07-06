import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import NotificationUpdate from "./NotificationUpdate";

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
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
});

notificationSchema.post("save", async function (next) {
  const notification = this;

  const notificationUpdateForUser = await NotificationUpdate.findOne({
    user: notification.user,
  });

  if (notificationUpdateForUser === null) {
    const newNotificationUpdate = new NotificationUpdate({
      user: notification.user,
      count: 1,
      inView: true,
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

  const notificationUpdateForUser = await NotificationUpdate.findOne({
    user: notification.user,
  });

  notificationUpdateForUser.count = notificationUpdateForUser.count - 1;
  await notificationUpdateForUser.save();
});

notificationSchema.plugin(mongoosePaginate);

const Notification = mongoose.model("notification", notificationSchema);

export default Notification;
