"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _School = _interopRequireDefault(require("../models/School"));

var _Course = _interopRequireDefault(require("../models/Course"));

var _SavedCourse = _interopRequireDefault(require("../models/SavedCourse"));

var _studentAuth = _interopRequireDefault(require("../middleware/studentAuth"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.post('/:schoolname/:courseId', _studentAuth.default, async (req, res) => {
  const schoolname = req.params.schoolname;
  const studentId = req.student.id;
  const idOfCourseToBeSaved = req.params.courseId;

  try {
    const school = await _School.default.findOne({
      name: schoolname
    });

    if (!school) {
      return res.status(400).json({
        errors: [{
          msg: 'school not found'
        }]
      });
    }

    const course = await _Course.default.findOne({
      _id: idOfCourseToBeSaved
    });

    if (!course) {
      return res.status(400).json({
        errors: [{
          msg: 'course not found'
        }]
      });
    }

    const courseAlreadySaved = await _SavedCourse.default.findOne({
      course: idOfCourseToBeSaved
    });

    if (courseAlreadySaved) {
      return res.status(400).json({
        errors: [{
          msg: 'course already saved'
        }]
      });
    }

    const newSavedCourse = new _SavedCourse.default({
      savedby: studentId,
      savedfrom: school._id,
      course: idOfCourseToBeSaved
    });
    await newSavedCourse.save();
    res.json(newSavedCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});
router.get('/:schoolname', _studentAuth.default, async (req, res) => {
  const schoolname = req.params.schoolname;
  const studentid = req.student.id;

  try {
    const school = await _School.default.findOne({
      name: schoolname
    });

    if (!school) {
      return res.status(400).json({
        errors: [{
          msg: 'school not found'
        }]
      });
    }

    const savedCourses = await _SavedCourse.default.find({
      savedby: studentid,
      savedfrom: school._id
    }).populate('course');
    res.json(savedCourses);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});
router.get('/:schoolname/:courseId', _studentAuth.default, async (req, res) => {
  const schoolname = req.params.schoolname;
  const studentId = req.student.id;
  const courseId = req.params.courseId;

  try {
    const school = await _School.default.findOne({
      name: schoolname
    });

    if (!school) {
      return res.status(400).json({
        errors: [{
          msg: 'school not found'
        }]
      });
    }

    const course = await _SavedCourse.default.findOne({
      _id: courseId,
      savedby: studentId
    }).populate('course');
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});
var _default = router;
exports.default = _default;