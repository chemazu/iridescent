import express from "express";
import { body, validationResult } from "express-validator";
import Notification from "../models/Notifications";
import NotificationUpdate from "../models/NotificationUpdate";

import auth from "../middleware/auth";

const router = express.Router();

router.post(
  "/",
  auth,
  body("message", "message not found").not().isEmpty(),
  body("type", "type not found").not().isEmpty(),
  body("notificationimage", "notificationimage not found").not().isEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.json({
          error: errors.array(),
        });
      }

      const userId = req.user.id;
      const { message, type, notificationimage } = req.body;

      const notificationObj = {
        user: userId,
        message,
        notificationimage,
        type,
      };

      const notification = new Notification(notificationObj);
      await notification.save();
      res.json(notification);
    } catch (error) {
      res.status(500).send("server error");
    }
  }
);

// route to get notifications by page
router.get("/", auth, async (req, res) => {
  const { page, size, filterString } = req.query;

  const limit = parseInt(size);
  const skip = parseInt(page - 1) * parseInt(size);
  const userId = req.user.id;

  const filterObject = {
    user: userId,
  };

  if (filterString.includes("all")) {
  } else if (filterString.includes("comment")) {
    filterObject["type"] = "comment added";
  } else if (filterString.includes("reply")) {
    filterObject["type"] = "reply added";
  } else if (filterString.includes("enroll")) {
    filterObject["type"] = "student enrollment";
  }

  try {
    const notifications = await Notification.find(
      filterObject,
      {},
      {
        skip: skip,
        limit: limit,
      }
    ).sort({
      date: -1,
    });

    const docsCount = await Notification.countDocuments({
      user: userId,
    });

    res.json({
      notifications,
      count: docsCount,
    });
  } catch (error) {
    res.status(500).send("server error");
  }
});

// route to mark all notifications as read
router.put("/", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    await Notification.updateMany(
      {
        user: userId,
      },
      {
        isSeen: true,
      }
    );

    const notificationUpdateForUser = await NotificationUpdate.findOne({
      user: userId,
    });

    notificationUpdateForUser.inView = false;
    notificationUpdateForUser.count = 0;

    await notificationUpdateForUser.save();

    const notifications = await Notification.find(
      {
        user: userId,
      },
      {},
      {
        skip: 0,
        limit: 10,
      }
    ).sort({
      date: -1,
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).send("server error");
    console.log(error);
  }
});

// route to mark one notification as seen..
router.put("/:notificationId", auth, async (req, res) => {
  const notificationId = req.params.notificationId;

  try {
    const notification = await Notification.findOne({
      _id: notificationId,
    });

    if (!notification) {
      return res.status(400).json({
        message: "notification not found",
      });
    }

    notification.isSeen = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).send("server error");
  }
});

// route to delete one notification
router.delete("/:notificationId", auth, async (req, res) => {
  const notificationId = req.params.notificationId;
  try {
    const notification = await Notification.findOne({
      _id: notificationId,
    });

    if (!notification) {
      return res.status(400).json({
        message: "notification not found",
      });
    }

    await notification.remove();
    res.json(notification);
  } catch (error) {
    res.status(500).send("server error");
  }
});

// route to delete all notifications
router.delete("/", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const notificationDeleteInfo = await Notification.deleteMany({
      user: userId,
    });

    const notificationUpdateForUser = await NotificationUpdate.findOne({
      user: userId,
    });

    await notificationUpdateForUser.remove();

    res.json(notificationDeleteInfo);
  } catch (error) {
    res.status(500).send("server error");
  }
});

export default router;
