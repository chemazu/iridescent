"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _cloudinary = _interopRequireDefault(require("cloudinary"));

var _expressValidator = require("express-validator");

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _validateUserPayment = _interopRequireDefault(require("../middleware/validateUserPayment"));

var _Course = _interopRequireDefault(require("../models/Course"));

var _CourseChapter = _interopRequireDefault(require("../models/CourseChapter"));

var _CourseUnit = _interopRequireDefault(require("../models/CourseUnit"));

var _Note = _interopRequireDefault(require("../models/Note"));

var _Reply = _interopRequireDefault(require("../models/Reply"));

var _Comment = _interopRequireDefault(require("../models/Comment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router(); // private route to create a new course module or chapter
// create new course module or chapter sends
// newly created coursechapter/module populated with course unit


router.post("/:courseId", [_auth.default, _validateUserPayment.default, (0, _expressValidator.body)("name", "module name cannot be empty").not().isEmpty()], async (req, res) => {
  try {
    const errors = (0, _expressValidator.validationResult)(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const courseId = req.params.courseId;
    const validCourse = await _Course.default.findOne({
      _id: courseId
    });

    if (!validCourse) {
      return res.status(400).json({
        errors: [{
          msg: "course not found"
        }]
      });
    }

    const newCourseChapterObject = new _CourseChapter.default({
      name: req.body.name,
      course: courseId,
      author: req.user.id
    });
    newCourseChapterObject.save(function (err, book) {
      _CourseChapter.default.populate(book, {
        path: "courseunit"
      }).then(function (book) {
        res.json(book);
      });
    });
  } catch (error) {
    console.error(error);
  }
}); // route to get modules/course-chapter by courseId

router.get("/:courseId", _auth.default, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const courseChapters = await _CourseChapter.default.find({
      course: courseId
    }).populate("courseunit");
    res.json(courseChapters);
  } catch (error) {
    console.error(error);
  }
}); // private route to update module name

router.put("/:moduleId", [_auth.default, _validateUserPayment.default, (0, _expressValidator.body)("name", "module name is required").not().isEmpty()], async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const moduleId = req.params.moduleId;
  const {
    name
  } = req.body;

  try {
    let courseChapter = await _CourseChapter.default.findOne({
      _id: moduleId
    });

    if (!courseChapter) {
      return res.status(400).json({
        errros: [{
          msg: "module not found"
        }]
      });
    }

    courseChapter.name = name;
    courseChapter.save(function (err, coursechapter) {
      _CourseChapter.default.populate(coursechapter, {
        path: "courseunit"
      }).then(module => {
        res.json(module);
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

const deleteCourseUnitAndExitingDetails = async courseUnitId => {
  try {
    const courseUnit = await _CourseUnit.default.findOne({
      _id: courseUnitId
    });

    if (!courseUnit) {
      return res.status(400).json({
        errors: [{
          msg: "courseunit not found"
        }]
      });
    } // delete course unit video from cloudinary


    await _cloudinary.default.v2.uploader.destroy(courseUnit.videopublicid, {
      resource_type: "video"
    }); // delete course unit attachments

    courseUnit.attachment.forEach(async attachment => {
      await _cloudinary.default.v2.uploader.destroy(attachment.attachmentPublicId, {
        resource_type: "raw"
      });
    }); // delete course unit notes

    await _Note.default.deleteMany({
      courseunit: mongoose.Types.ObjectId(courseUnitId)
    }); // delete course unit replies

    await _Reply.default.deleteMany({
      courseunit: mongoose.Types.ObjectId(courseUnitId)
    }); // delete course unit comments

    await _Comment.default.deleteMany({
      courseunit: mongoose.Types.ObjectId(courseUnitId)
    }); // delete the actual course Unit

    await courseUnit.remove();
    return courseUnit;
  } catch (error) {
    console.error(error);
  }
}; // private route to delete module and module course units


router.delete("/:moduleId", _auth.default, _validateUserPayment.default, async (req, res) => {
  try {
    const moduleId = req.params.moduleId;
    const module = await _CourseChapter.default.findOne({
      _id: moduleId
    });

    if (!module) {
      return res.status(400).json({
        errors: [{
          msg: "invalid module"
        }]
      });
    }

    const courseUnitsFromModule = await _CourseUnit.default.find({
      coursechapter: moduleId
    });
    const arrayOfCourseUnitDeleteOperations = [];
    courseUnitsFromModule.forEach(courseUnitsToBeDeleted => {
      arrayOfCourseUnitDeleteOperations.push(deleteCourseUnitAndExitingDetails(courseUnitsToBeDeleted._id));
    });
    await Promise.all(arrayOfCourseUnitDeleteOperations).then(values => {// console.log(values)
    }); // await CourseUnit.deleteMany({ coursechapter: moduleId })

    await module.remove();
    res.json(module);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});
var _default = router;
exports.default = _default;