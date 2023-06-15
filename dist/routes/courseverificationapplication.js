"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _CourseVerificationApplication = _interopRequireDefault(require("../models/CourseVerificationApplication"));

var _Course = _interopRequireDefault(require("../models/Course"));

var _CourseChapter = _interopRequireDefault(require("../models/CourseChapter"));

var _CourseUnit = _interopRequireDefault(require("../models/CourseUnit"));

var _User = _interopRequireDefault(require("../models/User"));

var _validateAdminRoute = _interopRequireDefault(require("../middleware/validateAdminRoute"));

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _admin = require("../emails/notifications/admin");

var _tutuor = require("../emails/notifications/tutuor");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.post("/", (0, _expressValidator.body)("courseId", "course id not valid").not().isEmpty(), (0, _expressValidator.body)("title", "title not found").not().isEmpty(), _auth.default, async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const {
    courseId,
    title
  } = req.body;

  try {
    const courseChapterCount = await _CourseChapter.default.countDocuments({
      course: courseId
    });
    const courseUnitCount = await _CourseUnit.default.countDocuments({
      course: courseId
    });

    if (courseChapterCount < 1 || courseUnitCount < 1) {
      return res.status(400).send({
        errors: [{
          msg: "course content does not have enough content to post on explore."
        }]
      });
    }

    const userRequest = await _User.default.findOne({
      _id: req.user.id
    });
    const admins = await _User.default.find({
      user_type: "admin"
    });
    const courseToVerify = await _Course.default.findOne({
      _id: courseId
    });

    if (courseToVerify.verification_in_review === true) {
      return res.status(400).json({
        errors: [{
          msg: "course verification in progress."
        }]
      });
    }

    if (courseToVerify.is_verified === true) {
      return res.status(400).json({
        errors: [{
          msg: "course has been verified."
        }]
      });
    }

    const newCourseVerification = new _CourseVerificationApplication.default({
      course_id: courseId,
      title: title,
      course_author: req.user.id
    });
    courseToVerify.verification_in_review = true;
    await courseToVerify.save();
    await newCourseVerification.save(); // notify user of request

    await (0, _tutuor.emailNotificationForCourseVerification)(userRequest.email); // notify admins of request

    admins.forEach(async admin => {
      const courseDetails = {
        validationRequestId: newCourseVerification._id,
        courseTitle: title
      };
      const userDetails = {
        firstname: userRequest.firstname,
        lastname: userRequest.lastname,
        username: userRequest.username
      };
      await (0, _admin.notifyAdminOnCourseVerificationRequest)(admin.email, courseDetails, userDetails);
    });
    res.json(newCourseVerification);
  } catch (error) {
    res.status(500).json({
      msg: "error processing request"
    });
    console.log(error);
  }
});
router.get("/:courseVerificationId", _auth.default, _validateAdminRoute.default, async (req, res) => {
  const courseVerificationId = req.params.courseVerificationId;

  try {
    const courseVerification = await _CourseVerificationApplication.default.findOne({
      _id: courseVerificationId
    }).populate("course_id").populate("course_author", ["firstname", "lastname"]);
    res.json(courseVerification);
  } catch (error) {
    res.status(500).json({
      msg: "error processing request"
    });
    console.log(error);
  }
});
router.get("/status/unverified", _auth.default, _validateAdminRoute.default, async (req, res) => {
  try {
    const courseVerifications = await _CourseVerificationApplication.default.find({
      is_verified: false
    }).populate("course_id", ["title", "thumbnail", "price"]).populate("course_author", ["firstname", "lastname"]);
    res.json(courseVerifications);
  } catch (error) {
    res.status(500).json({
      msg: "error processing request"
    });
    console.log(error);
  }
});
router.get("/status/verified", _auth.default, _validateAdminRoute.default, async (req, res) => {
  try {
    const courseVerifications = await _CourseVerificationApplication.default.find({
      is_verified: true
    }).populate("course_id", ["title", "thumbnail", "price"]).populate("course_author", ["firstname", "lastname"]);
    res.json(courseVerifications);
  } catch (error) {
    res.status(500).json({
      msg: "error processing request"
    });
    console.log(error);
  }
}); // route to mark a course as verified

router.put("/:courseVerificationId", _auth.default, _validateAdminRoute.default, async (req, res) => {
  const courseVerificationId = req.params.courseVerificationId;

  try {
    const courseVerificationRecord = await _CourseVerificationApplication.default.findOne({
      _id: courseVerificationId
    });

    if (!courseVerificationRecord) {
      return res.json({
        errors: [{
          msg: "resource not found."
        }]
      });
    }

    const userRequest = await _User.default.findOne({
      _id: courseVerificationRecord.course_author
    });
    const course = await _Course.default.findOne({
      _id: courseVerificationRecord.course_id
    });
    course.is_verified = true;
    course.verification_in_review = false;
    courseVerificationRecord.verified_by = req.user.id;
    courseVerificationRecord.is_verified = true;
    await course.save();
    await courseVerificationRecord.save();
    await (0, _tutuor.emailNotificationForCourseVerificationCompleted)(userRequest.email);
    res.json(courseVerificationRecord);
  } catch (error) {
    res.status(500).json({
      msg: "error processing request"
    });
    console.log(error);
  }
}); // route to reject a course as verified

router.put("/reject/:courseVerificationId", (0, _expressValidator.body)("reason", "Rejection must have a reason").not().isEmpty(), _auth.default, _validateAdminRoute.default, async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const courseVerificationId = req.params.courseVerificationId;
  const {
    reason
  } = req.body;

  try {
    const courseVerificationRecord = await _CourseVerificationApplication.default.findOne({
      _id: courseVerificationId
    }).populate("course_author", ["email"]);

    if (!courseVerificationRecord) {
      return res.json({
        errors: [{
          msg: "resource not found."
        }]
      });
    }

    const course = await _Course.default.findOne({
      _id: courseVerificationRecord.course_id
    });
    course.verification_in_review = false;
    await course.save();
    await courseVerificationRecord.remove();
    await (0, _tutuor.emailNotificationForCourseRejected)(courseVerificationRecord.course_author.email, reason);
    res.json(courseVerificationRecord);
  } catch (error) {
    res.status(500).json({
      msg: "error processing request"
    });
    console.log(error);
  }
});
var _default = router;
exports.default = _default;