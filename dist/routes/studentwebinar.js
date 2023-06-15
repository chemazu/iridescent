"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _School = _interopRequireDefault(require("../models/School"));

var _studentAuth = _interopRequireDefault(require("../middleware/studentAuth"));

var _StudentWebinar = _interopRequireDefault(require("../models/StudentWebinar"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router(); // route to get list of purchased student courses
// from a particular school


router.get("/:schoolname", _studentAuth.default, async (req, res) => {
  const schoolname = req.params.schoolname;
  const studentId = req.student.id;

  try {
    const school = await _School.default.findOne({
      name: schoolname
    });

    if (!school) {
      return res.status(400).json({
        errors: [{
          msg: "school not found"
        }]
      });
    }

    const studentWebinars = await _StudentWebinar.default.find({
      student: studentId,
      boughtfrom: school._id
    }).populate("webinarBought");
    res.json(studentWebinars);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});
var _default = router;
exports.default = _default;