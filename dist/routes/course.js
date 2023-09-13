"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _cloudinary = _interopRequireDefault(require("cloudinary"));

var _expressValidator = require("express-validator");

var _multer = _interopRequireWildcard(require("multer"));

var _Course = _interopRequireDefault(require("../models/Course"));

var _School = _interopRequireDefault(require("../models/School"));

var _Tutor = _interopRequireDefault(require("../models/Tutor"));

var _User = _interopRequireDefault(require("../models/User"));

var _PaymentPlans = _interopRequireDefault(require("../models/PaymentPlans"));

var _CourseUnit = _interopRequireDefault(require("../models/CourseUnit"));

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _validateUserPayment = _interopRequireDefault(require("../middleware/validateUserPayment"));

var _dataUri = _interopRequireDefault(require("../utilities/dataUri"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

const storageDest = (0, _multer.memoryStorage)();
const createCourseThumbnailPhoto = (0, _multer.default)({
  storage: storageDest,

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|PNG|JPG|JPEG)$/)) {
      return cb(new Error("Please Upload another video"));
    }

    cb(undefined, true);
  }

});
router.post("/:schoolId", [_auth.default, _validateUserPayment.default, createCourseThumbnailPhoto.single("file"), (0, _expressValidator.body)("title", "title is required").not().isEmpty(), (0, _expressValidator.body)("subtitle", "subtitle is required").not().isEmpty(), (0, _expressValidator.body)("category", "category is required").not().isEmpty(), (0, _expressValidator.body)("rootcategory", "root category is required").not().isEmpty(), (0, _expressValidator.body)("description", "description is required").not().isEmpty(), (0, _expressValidator.body)("prerequisite", "prerequisites is required").not().isEmpty(), (0, _expressValidator.body)("language", "language is required").not().isEmpty(), (0, _expressValidator.body)("level", "level is required").not().isEmpty(), (0, _expressValidator.body)("thumbnail", "thumbnail is required").not().isEmpty(), (0, _expressValidator.body)("price", "price is required").not().isEmpty()], async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req.body);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  if (req.body.price < 2000) {
    return res.status(400).json({
      errors: [{
        msg: "invalid course price"
      }]
    });
  }

  const schoolId = req.params.schoolId;
  const userId = req.user.id;
  let foundTutor = null;

  try {
    const validUser = await _User.default.findOne({
      _id: userId
    });
    const userPaymentPlan = await _PaymentPlans.default.findOne({
      // get infomation on the users payment plan and what he can have access to.
      _id: validUser.selectedplan
    });
    const coursesCount = await _Course.default.countDocuments({
      // to get the count of courses the user has created
      author: userId
    });

    if (userPaymentPlan.coursecount === coursesCount) {
      return res.status(402).json({
        message: "upgrade your plan to upload more courses!"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        errors: [{
          msg: "thumbnail file not found"
        }]
      });
    }

    const {
      title,
      subtitle,
      category,
      rootcategory,
      description,
      prerequisite,
      language,
      level,
      price,
      tutorEmail
    } = req.body;
    let school = await _School.default.findOne({
      _id: schoolId
    });

    if (!school) {
      return res.status(400).json({
        errors: [{
          msg: "school not found"
        }]
      });
    }

    if (tutorEmail) {
      foundTutor = await _Tutor.default.findOne({
        email: tutorEmail
      });
    }

    const fileType = `.${req.file.originalname.split(".")[req.file.originalname.split(".").length - 1]}`;
    const imageToBeUploaded = (0, _dataUri.default)(`${fileType}`, req.file.buffer).content;
    const uploadResponse = await _cloudinary.default.v2.uploader.upload(imageToBeUploaded, {
      folder: `tuturly/course/${title}`
    });
    let course = new _Course.default({
      title,
      subtitle,
      category,
      rootcategory,
      description,
      prerequisite,
      language,
      level,
      thumbnail: uploadResponse.secure_url,
      price,
      coursethumbnailid: uploadResponse.public_id,
      transferedToCloudflare: true,
      // interim key used to keep track of courses that have videos in cloudflare.
      //  before all videos are completely transfered from cloudinary to cloudflare
      author: userId,
      school: schoolId,
      tutor: foundTutor !== null ? foundTutor._id : null
    });
    await course.save();
    school.courses.unshift(course._id);
    await school.save();
    res.json(course);
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
}); // code to check if user plan can create new course
// when create new course button is clicked

router.get("/user/createcourse", _auth.default, async (req, res) => {
  const userId = req.user.id;

  try {
    const validUser = await _User.default.findOne({
      _id: userId
    });
    const userPaymentPlan = await _PaymentPlans.default.findOne({
      // get infomation on the users payment plan and what he can have access to.
      _id: validUser.selectedplan // the user's subscription plans

    });
    const coursesCount = await _Course.default.countDocuments({
      // to get the count of courses the user has created
      author: userId
    });

    if (userPaymentPlan.coursecount === coursesCount) {
      return res.status(402).json({
        message: "upgrade your plan to upload more courses!"
      });
    }

    res.status(200).send("done.");
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
}); // route to get specific course by courseId

router.get("/:courseId", async (req, res) => {
  try {
    const course = await _Course.default.findOne({
      _id: req.params.courseId
    }).populate("author");

    if (!course) {
      return res.status(400).json({
        errors: [{
          msg: "course not found"
        }]
      });
    }

    res.json(course);
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
}); // route to get all courses by school

router.get("/school/:schoolId", _auth.default, async (req, res) => {
  try {
    const courses = await _Course.default.find({
      school: req.params.schoolId
    }).populate("author");
    res.json(courses);
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
}); // route to get all courses by author

router.get("/author/:authorId", _auth.default, async (req, res) => {
  try {
    const courses = await _Course.default.find({
      author: req.params.authorId
    });
    res.json(courses);
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
}); // route to update course by id

router.put("/:courseId", _auth.default, _validateUserPayment.default, async (req, res) => {
  const courseId = req.params.courseId;

  try {
    let course = await _Course.default.findOne({
      _id: courseId
    });

    if (!course) {
      return res.status(404).json({
        errors: [{
          msg: "course not found"
        }]
      });
    }

    const {
      title,
      subtitle,
      category,
      rootcategory,
      description,
      prerequisite,
      language,
      level,
      thumbnail,
      price,
      coursediscount
    } = req.body;
    if (title) course.title = title;
    if (subtitle) course.subtitle = subtitle;
    if (category) course.category = category;
    if (rootcategory) course.rootcategory = rootcategory;
    if (description) course.description = description;
    if (prerequisite) course.prerequisite = prerequisite;
    if (language) course.language = language;
    if (level) course.level = level;
    if (thumbnail) course.thumbnail = thumbnail;
    if (price) course.price = price;
    if (coursediscount) course.coursediscount = coursediscount;
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
});
const storageDestForThumnailUpload = (0, _multer.memoryStorage)();
const thumbUploadHandler = (0, _multer.default)({
  storage: storageDestForThumnailUpload,

  fileFilter(req, file, cb) {
    if (file.mimetype.includes("image")) {
      cb(null, true);
    } else {
      cb({
        message: "Unsupported file format"
      }, false);
    }
  }

}); // route to update course thumbnail

router.put("/:courseId/thumbnail", _auth.default, _validateUserPayment.default, thumbUploadHandler.single("thumbnail"), async (req, res) => {
  const courseId = req.params.courseId;

  if (!req.file) {
    return res.status(400).json({
      errors: [{
        msg: "image file not found"
      }]
    });
  }

  try {
    const course = await _Course.default.findOne({
      _id: courseId
    });

    if (!course) {
      return res.status(400).json({
        errors: [{
          msg: "course not found"
        }]
      });
    } // delete previous thumbnail by course thumbnail id


    await _cloudinary.default.v2.uploader.destroy(course.coursethumbnailid);
    const fileType = `.${req.file.originalname.split(".")[req.file.originalname.split(".").length - 1]}`;
    const imageToBeUploaded = (0, _dataUri.default)(`${fileType}`, req.file.buffer).content;
    const uploadResponse = await _cloudinary.default.v2.uploader.upload(imageToBeUploaded, {
      folder: `tuturly/course/${course.title}`
    });
    course.thumbnail = uploadResponse.secure_url;
    course.coursethumbnailid = uploadResponse.public_id;
    await course.save();
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});
router.put("/review/:courseId", _auth.default, _validateUserPayment.default, [(0, _expressValidator.body)("comment", "comment is required").not().isEmpty()], async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const courseId = req.params.courseId;
  const {
    comment,
    star
  } = req.body;

  try {
    let course = await _Course.default.findOne({
      _id: courseId
    });

    if (!course) {
      return res.status(400).json({
        errors: [{
          msg: "invalid course"
        }]
      });
    }

    const user = await _User.default.findOne({
      _id: req.user.id
    });
    let userReview = {
      name: `${user.firstname} ${user.lastname}`,
      email: user.email,
      comment,
      date: Date.now()
    };
    if (star) userReview.star = star;

    if (course.reviews.filter(review => review.email.toString().toLowerCase() === user.email.toLowerCase()).length > 0) {
      return res.status(400).json({
        errors: [{
          msg: "user review already exists"
        }]
      });
    }

    course.reviews.unshift(userReview);
    await course.save();
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
}); // route to remove review from course

router.put("/review/:courseId/:reviewId", _auth.default, _validateUserPayment.default, async (req, res) => {
  try {
    let course = await _Course.default.findOne({
      _id: req.params.courseId
    });

    if (!course) {
      return res.status(400).json({
        errors: [{
          msg: "invalid course"
        }]
      });
    }

    course.reviews = course.reviews.filter(review => review._id === req.params.reviewId);
    await course.save();
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
}); // route to delete course by ID

router.delete("/:courseId", _auth.default, _validateUserPayment.default, async (req, res) => {
  try {
    const course = await _Course.default.findOne({
      _id: req.params.courseId
    });

    if (!course) {
      return res.status(400).json({
        errors: [{
          msg: "course not found"
        }]
      });
    }

    await course.remove();
    res.json(course);
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
}); // route to update publish status course by id

router.put("/publish/:courseId", _auth.default, _validateUserPayment.default, async (req, res) => {
  const courseId = req.params.courseId;

  try {
    const course = await _Course.default.findOne({
      _id: courseId
    });

    if (!course) {
      return res.status(404).json({
        errors: [{
          msg: "course not found"
        }]
      });
    } // check if course has units/videos that are still processing


    const courseUnits = await _CourseUnit.default.find({
      isStreamReady: false,
      course: course._id
    });

    if (courseUnits.length > 0) {
      return res.status(400).json({
        errors: [{
          msg: "your course video's are still processing"
        }]
      });
    }

    course.published = true;
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
}); // route to update course retract status

router.put("/retract/:courseId", _auth.default, _validateUserPayment.default, async (req, res) => {
  const courseId = req.params.courseId;

  try {
    let course = await _Course.default.findOne({
      _id: courseId
    });

    if (!course) {
      return res.status(404).json({
        errors: [{
          msg: "course not found"
        }]
      });
    }

    course.published = false;
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
});
router.get("/count/:authorId", _auth.default, async (req, res) => {
  try {
    const coursesCount = await _Course.default.countDocuments({
      author: req.params.authorId
    });
    res.json(coursesCount);
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
});
router.get("/courses/explore", async (req, res) => {
  const {
    page,
    size,
    titleQuery,
    categoryQuery
  } = req.query;
  const limit = parseInt(size);
  const skip = parseInt(page - 1) * size;
  const titleRegex = new RegExp(titleQuery, "i");
  const categoryRegex = new RegExp(categoryQuery, "i");

  try {
    const courses = await _Course.default.find({
      title: {
        $regex: titleRegex
      },
      category: {
        $regex: categoryRegex
      },
      is_verified: true
    }).populate("author", ["firstname", "lastname", "username"]).limit(limit).skip(skip).sort({
      createdAt: -1
    });
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});
var _default = router;
exports.default = _default;