"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _School = _interopRequireDefault(require("../models/School"));

var _CourseChapter = _interopRequireDefault(require("../models/CourseChapter"));

var _StudentCourse = _interopRequireDefault(require("../models/StudentCourse"));

var _CourseUnit = _interopRequireDefault(require("../models/CourseUnit"));

var _studentAuth = _interopRequireDefault(require("../middleware/studentAuth"));

var _expressValidator = require("express-validator");

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

    const studentCourses = await _StudentCourse.default.find({
      student: studentId,
      boughtfrom: school._id
    }).populate({
      path: "coursebought",
      model: "course"
    });
    res.json(studentCourses);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
}); // route to get a specific course By ID
// from a particular school

router.get("/:schoolname/:courseid", _studentAuth.default, async (req, res) => {
  const schoolname = req.params.schoolname;
  const courseId = req.params.courseid;

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

    const course = await _StudentCourse.default.findOne({
      _id: courseId,
      boughtfrom: school._id
    }).populate("coursebought");
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
}); // loading a single Purchasedcourse modules in Route

router.get("/:schoolname/modules/:courseId", _studentAuth.default, async (req, res) => {
  const schoolname = req.params.schoolname;
  const courseId = req.params.courseId;

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

    const courseChapters = await _CourseChapter.default.find({
      course: courseId
    }).populate({
      path: "courseunit",
      select: ["name", "videothumbnail", "duration", "coursechapter", "position"],
      options: {
        sort: {
          position: 1
        }
      }
    });
    res.json(courseChapters);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
}); // router used to get a single course unit
// so it can be loaded by the player

router.get("/courseunit/load/:courseunitId", _studentAuth.default, async (req, res) => {
  const courseunitId = req.params.courseunitId;

  try {
    const courseUnit = await _CourseUnit.default.findOne({
      _id: courseunitId
    });

    if (courseUnit.isCloudflareVideoSource === true) {
      return res.json(courseUnit);
    }

    const splitResult = courseUnit.videourl.split("upload");
    const videourl = `${splitResult[0]}upload/q_35/f_auto${splitResult[1]}`;
    const webmvideourl = videourl.replace(".mp4", ".webm");
    const ogvvideourl = videourl.replace(".mp4", ".ogv");
    const unitJsonObject = { ...courseUnit.toObject(),
      videourl,
      webmvideourl,
      ogvvideourl
    };
    res.json(unitJsonObject);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
}); // route used to update the student progress in the course
// used to keep track of the last seen coursemodule,
// courseunit and timestamp

router.put("/:schoolname/:courseid", _studentAuth.default, [(0, _expressValidator.body)("coursemoduleinview", "course module id cannot be empty").not().isEmpty(), (0, _expressValidator.body)("courseunitlastviewed", "course unit id cannot be empty").not().isEmpty(), (0, _expressValidator.body)("unitprogresstimestamp", "unit progress timestamp cannot be empty").not().isEmpty()], async (req, res) => {
  const schoolname = req.params.schoolname;
  const courseId = req.params.courseid; // courseId to find the unique courseId that the student bought.
  // the updates here would be used to track student progress
  // const studentId = req.student.id

  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.json({
      error: errors.array()
    });
  }

  try {
    const {
      coursemoduleinview,
      courseunitlastviewed,
      unitprogresstimestamp
    } = req.body;
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

    const course = await _StudentCourse.default.findOne({
      _id: courseId
    }).populate("coursebought");
    course.coursemoduleinview = coursemoduleinview;
    course.courseunitlastviewed = courseunitlastviewed;
    course.unitprogresstimestamp = unitprogresstimestamp;
    await course.save();
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});
router.get("/next/:moduleId/:positionOfCurrentVideo", _studentAuth.default, async (req, res) => {
  const moduleId = req.params.moduleId;
  const positionOfCurrentVideo = req.params.positionOfCurrentVideo;

  try {
    const positionOfNextVideo = parseInt(positionOfCurrentVideo) + 1;
    const courseUnit = await _CourseUnit.default.findOne({
      coursechapter: moduleId,
      position: positionOfNextVideo
    });
    res.json(courseUnit);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});
var _default = router;
exports.default = _default;