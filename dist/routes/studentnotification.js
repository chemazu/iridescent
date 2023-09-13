"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _StudentNotification = _interopRequireDefault(require("../models/StudentNotification"));

var _studentAuth = _interopRequireDefault(require("../middleware/studentAuth"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router(); // route to get notifications by page


router.get("/", _studentAuth.default, async (req, res) => {
  const {
    page,
    size
  } = req.query;
  const limit = parseInt(size);
  const skip = parseInt(page - 1) * parseInt(size);

  try {
    const studentId = req.student.id;
    const studentNotifications = await _StudentNotification.default.find({
      student: studentId
    }, {}, {
      skip: skip,
      limit: limit
    }).sort({
      date: -1
    });
    const docsCount = await _StudentNotification.default.countDocuments({
      student: studentId
    });
    res.json({
      studentNotifications,
      docsCount
    });
  } catch (error) {
    res.status(500).send("server error");
  }
});
var _default = router;
exports.default = _default;