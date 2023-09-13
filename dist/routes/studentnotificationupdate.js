"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _StudentNotificationUpdate = _interopRequireDefault(require("../models/StudentNotificationUpdate"));

var _studentAuth = _interopRequireDefault(require("../middleware/studentAuth"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router(); // route to read user notification update
// it also create's on just for user's that don't have
// a notifications update already...


router.get("/", _studentAuth.default, async (req, res) => {
  const studentId = req.student?.id;

  try {
    const notificationUpdate = await _StudentNotificationUpdate.default.findOne({
      student: studentId
    });

    if (notificationUpdate === null) {
      const newNotificationUpdate = new _StudentNotificationUpdate.default({
        student: studentId,
        count: 0,
        inView: false
      });
      await newNotificationUpdate.save();
      return res.json(newNotificationUpdate);
    }

    res.json(notificationUpdate);
  } catch (error) {
    res.status(500).json({
      errors: error
    });
    console.error(error);
  }
}); // route to update notification update
// when notification page displays
// changes the inView prop to false

router.put("/", _studentAuth.default, async (req, res) => {
  const studentId = req.student.id;

  try {
    const notificationUpdate = await _StudentNotificationUpdate.default.findOne({
      student: studentId
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