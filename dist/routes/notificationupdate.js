"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _NotificationUpdate = _interopRequireDefault(require("../models/NotificationUpdate"));

var _auth = _interopRequireDefault(require("../middleware/auth"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router(); // route to read user notification update
// it also create's on just for user's that don't have 
// a notifications update already...


router.get('/', _auth.default, async (req, res) => {
  const userId = req.user.id;

  try {
    const notificationupdate = await _NotificationUpdate.default.findOne({
      user: userId
    });

    if (notificationupdate === null) {
      const newNotificationUpdate = new _NotificationUpdate.default({
        user: userId,
        count: 0,
        inView: false
      });
      await newNotificationUpdate.save();
      return res.json(newNotificationUpdate);
    }

    res.json(notificationupdate);
  } catch (error) {
    res.status(500).json({
      errors: error
    });
    console.error(error);
  }
}); // route to update notification update
// when notification page displays
// changes the inView prop to false 

router.put('/', _auth.default, async (req, res) => {
  const userId = req.user.id;

  try {
    const notificationUpdate = await _NotificationUpdate.default.findOne({
      user: userId
    });
    notificationUpdate.inView = false;
    notificationUpdate.count = 0;
    await notificationUpdate.save();
    res.json(notificationUpdate);
  } catch (error) {
    res.status(500).json({
      errors: error
    });
    console.error(error);
  }
});
var _default = router;
exports.default = _default;