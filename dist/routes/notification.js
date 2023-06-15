"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _Notifications = _interopRequireDefault(require("../models/Notifications"));

var _NotificationUpdate = _interopRequireDefault(require("../models/NotificationUpdate"));

var _auth = _interopRequireDefault(require("../middleware/auth"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.post("/", _auth.default, (0, _expressValidator.body)("message", "message not found").not().isEmpty(), (0, _expressValidator.body)("type", "type not found").not().isEmpty(), (0, _expressValidator.body)("notificationimage", "notificationimage not found").not().isEmpty(), async (req, res) => {
  try {
    const errors = (0, _expressValidator.validationResult)(req);

    if (!errors.isEmpty()) {
      return res.json({
        error: errors.array()
      });
    }

    const userId = req.user.id;
    const {
      message,
      type,
      notificationimage
    } = req.body;
    const notificationObj = {
      user: userId,
      message,
      notificationimage,
      type
    };
    const notification = new _Notifications.default(notificationObj);
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).send("server error");
  }
}); // route to get notifications by page

router.get("/", _auth.default, async (req, res) => {
  const {
    page,
    size,
    filterString
  } = req.query;
  const limit = parseInt(size);
  const skip = parseInt(page - 1) * parseInt(size);
  const userId = req.user.id;
  const filterObject = {
    user: userId
  };

  if (filterString.includes("all")) {} else if (filterString.includes("comment")) {
    filterObject["type"] = "comment added";
  } else if (filterString.includes("reply")) {
    filterObject["type"] = "reply added";
  } else if (filterString.includes("enroll")) {
    filterObject["type"] = "student enrollment";
  }

  try {
    const notifications = await _Notifications.default.find(filterObject, {}, {
      skip: skip,
      limit: limit
    }).sort({
      date: -1
    });
    const docsCount = await _Notifications.default.countDocuments({
      user: userId
    });
    res.json({
      notifications,
      count: docsCount
    });
  } catch (error) {
    res.status(500).send("server error");
  }
}); // route to mark all notifications as read

router.put("/", _auth.default, async (req, res) => {
  const userId = req.user.id;

  try {
    await _Notifications.default.updateMany({
      user: userId
    }, {
      isSeen: true
    });
    const notificationUpdateForUser = await _NotificationUpdate.default.findOne({
      user: userId
    });
    notificationUpdateForUser.inView = false;
    notificationUpdateForUser.count = 0;
    await notificationUpdateForUser.save();
    const notifications = await _Notifications.default.find({
      user: userId
    }, {}, {
      skip: 0,
      limit: 10
    }).sort({
      date: -1
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).send("server error");
    console.log(error);
  }
}); // route to mark one notification as seen..

router.put("/:notificationId", _auth.default, async (req, res) => {
  const notificationId = req.params.notificationId;

  try {
    const notification = await _Notifications.default.findOne({
      _id: notificationId
    });

    if (!notification) {
      return res.status(400).json({
        message: "notification not found"
      });
    }

    notification.isSeen = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).send("server error");
  }
}); // route to delete one notification

router.delete("/:notificationId", _auth.default, async (req, res) => {
  const notificationId = req.params.notificationId;

  try {
    const notification = await _Notifications.default.findOne({
      _id: notificationId
    });

    if (!notification) {
      return res.status(400).json({
        message: "notification not found"
      });
    }

    await notification.remove();
    res.json(notification);
  } catch (error) {
    res.status(500).send("server error");
  }
}); // route to delete all notifications

router.delete("/", _auth.default, async (req, res) => {
  const userId = req.user.id;

  try {
    const notificationDeleteInfo = await _Notifications.default.deleteMany({
      user: userId
    });
    const notificationUpdateForUser = await _NotificationUpdate.default.findOne({
      user: userId
    });
    await notificationUpdateForUser.remove();
    res.json(notificationDeleteInfo);
  } catch (error) {
    res.status(500).send("server error");
  }
});
var _default = router;
exports.default = _default;