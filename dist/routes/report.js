"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _Report = _interopRequireDefault(require("../models/Report"));

var _School = _interopRequireDefault(require("../models/School"));

var _CourseUnit = _interopRequireDefault(require("../models/CourseUnit"));

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _studentAuth = _interopRequireDefault(require("../middleware/studentAuth"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router(); // route to create a new report
// private route


router.post("/", _studentAuth.default, [(0, _expressValidator.body)("schoolid", "school ID not found").not().isEmpty(), (0, _expressValidator.body)("course", "course ID not found").not().isEmpty(), (0, _expressValidator.body)("courseunitid", "courseunit ID not found").not().isEmpty(), (0, _expressValidator.body)("reason", "reason cannot be empty").not().isEmpty()], async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const {
    schoolid,
    course,
    courseunitid,
    reason,
    description
  } = req.body;
  const studentId = req.student.id;

  try {
    const school = await _School.default.findOne({
      _id: schoolid
    });

    if (!school) {
      return res.status(400).json({
        errors: [{
          msg: "school not found"
        }]
      });
    }

    const courseUnit = await _CourseUnit.default.findOne({
      _id: courseunitid
    });

    if (!courseUnit) {
      return res.status(400).json({
        errors: [{
          msg: "courseunit not found"
        }]
      });
    }

    const reportObj = {
      school: schoolid,
      course: course,
      courseunitid: courseunitid,
      tutuor: school.createdBy,
      reason: reason,
      student: studentId
    };

    if (description) {
      reportObj["description"] = description;
    }

    const newReport = new _Report.default(reportObj);
    await newReport.save();
    res.json(newReport);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
}); // Router to get a single route by RouteID

router.get("/:reportId", _auth.default, async (req, res) => {
  const reportId = req.params.reportId;

  try {
    const report = await _Report.default.findOne({
      _id: reportId
    });

    if (!report) {
      return res.status(400).json({
        errors: [{
          msg: "school not found"
        }]
      });
    }

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
}); // Route to get all Reports by reports

router.get("/", _auth.default, async (req, res) => {
  const {
    page,
    size
  } = req.query;
  const limit = parseInt(size);
  const skip = parseInt(page - 1) * size;

  try {
    const reports = _Report.default.find();

    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});
var _default = router;
exports.default = _default;