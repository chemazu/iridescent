"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _expressValidator = require("express-validator");

var _gravatar = _interopRequireDefault(require("gravatar"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _Tutor = _interopRequireDefault(require("../models/Tutor"));

var _School = _interopRequireDefault(require("../models/School"));

var _Product = _interopRequireDefault(require("../models/Product"));

var _Course = _interopRequireDefault(require("../models/Course"));

var _CourseUnit = _interopRequireDefault(require("../models/CourseUnit"));

var _CourseChapter = _interopRequireDefault(require("../models/CourseChapter"));

var _tutorAuth = _interopRequireDefault(require("../middleware/tutorAuth"));

var _Order = _interopRequireDefault(require("../models/Order"));

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _validateAdminRoute = _interopRequireDefault(require("../middleware/validateAdminRoute"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _Student = _interopRequireDefault(require("../models/Student"));

var _generatePastSixMonths = _interopRequireDefault(require("../utilities/generatePastSixMonths"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

const tokenSecret = process.env.JWTSECRET;
router.post("/", [(0, _expressValidator.body)("firstname", "firstname not valid").not().isEmpty(), (0, _expressValidator.body)("lastname", "lasname not valid").not().isEmpty(), (0, _expressValidator.body)("email", "email not valid").isEmail(), (0, _expressValidator.body)("password", "Please enter a password with 6 or more characters").isLength({
  min: 6
})], async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  try {
    const {
      firstname,
      lastname,
      email,
      password
    } = req.body;
    const existingTutor = await _Tutor.default.findOne({
      email: email
    });

    if (existingTutor) {
      return res.status(400).json({
        errors: [{
          msg: "user already exist's"
        }]
      });
    }

    const avatar = _gravatar.default.url(email, {
      s: "250",
      r: "pg",
      d: "mm"
    });

    const salt = await _bcryptjs.default.genSalt(10); // generate salt for password

    const tutor = new _Tutor.default({
      firstname,
      lastname,
      email,
      avatar,
      password: await _bcryptjs.default.hash(password, salt)
    });
    await tutor.save();
    const payload = {
      tutor: {
        id: tutor._id
      }
    };

    _jsonwebtoken.default.sign(payload, tokenSecret, {
      expiresIn: 360000
    }, (err, token) => {
      if (err) throw err;
      const newUserData = Object.assign(tutor.toObject(), {});
      delete newUserData.password;
      res.json({
        token,
        tutor: newUserData
      });
    });
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
}); // route to get school courses by school name

router.get("/courses/:schoolname", async (req, res) => {
  const schoolname = req.params.schoolname;

  try {
    const school = await _School.default.findOne({
      name: schoolname
    });

    if (!school) {
      return res.status(404).json({
        errors: [{
          msg: "school not found"
        }]
      });
    }

    const courses = await _Course.default.find({
      school: school._id,
      published: true
    }).populate("tutor");
    res.json(courses);
  } catch (error) {
    console.log(error);
    res.status(500).send("server error");
  }
}); // route to get school products by school name

router.get("/products/:schoolname", async (req, res) => {
  const schoolname = req.params.schoolname;

  try {
    const school = await _School.default.findOne({
      name: schoolname
    });

    if (!school) {
      return res.status(404).json({
        errors: [{
          msg: "school not found"
        }]
      });
    }

    const products = await _Product.default.find({
      school: school._id,
      published: true
    }).populate("tutor");
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).send("server error");
  }
}); // route to get course details for the tutors.courses subdomain page

router.get("/course/:courseId", async (req, res) => {
  const courseId = req.params.courseId;

  try {
    const course = await _Course.default.findOne({
      _id: courseId
    }).populate("coursechapters");
    const courseUnitsInCourse = await _CourseUnit.default.find({
      course: course._id
    });
    const courseChapterCount = await _CourseChapter.default.countDocuments({
      course: course._id
    });
    const durationSum = courseUnitsInCourse.reduce((prev, curr) => {
      return Number(prev) + Number(curr.duration);
    }, 0);
    res.json({
      course,
      courseduration: durationSum,
      episodes: courseChapterCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
}); // route to get course Modules by CourseId

router.get("/course/modules/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const courseChapters = await _CourseChapter.default.find({
      course: courseId
    }).populate("courseunit");
    res.json(courseChapters);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
}); // route to get logged in tutor in tutor dashboard

router.get("/me", _tutorAuth.default, async (req, res) => {
  try {
    const tutorId = req.tutor.id;
    const tutor = await _Tutor.default.findById(tutorId).select("-password");

    if (!tutor) {
      return res.status(404).json({
        errors: [{
          msg: "tutor not found"
        }]
      });
    }

    res.json(tutor);
  } catch (error) {
    console.error(error);
    res.status(500).send("internal server error");
  }
}); // route to get specific product by productID
// schoolname is searched to ensure valid school is used

router.get("/product/:productId", async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await _Product.default.findOne({
      _id: productId
    });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});
router.post("/login", (0, _expressValidator.body)("email", "please include a valid email").isEmail(), (0, _expressValidator.body)("password", "Please enter a password").exists(), async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.json({
      errors: errors.array()
    });
  }

  const {
    email,
    password
  } = req.body;

  try {
    const tutor = await _Tutor.default.findOne({
      email: email
    });

    if (!tutor) {
      return res.status(400).json({
        errors: [{
          msg: "invalid credentials"
        }]
      });
    }

    const isMatch = await _bcryptjs.default.compare(password, tutor.password);

    if (!isMatch) {
      return res.status(400).json({
        errors: [{
          msg: "invalid credentials"
        }]
      });
    } // code to create token payload


    const payload = {
      tutor: {
        id: tutor._id
      }
    };

    _jsonwebtoken.default.sign(payload, tokenSecret, {
      expiresIn: 360000
    }, (err, token) => {
      if (err) throw err;
      const newUserData = Object.assign(tutor.toObject(), {});
      delete newUserData.password;
      res.json({
        token,
        tutor: newUserData
      });
    });
  } catch (error) {
    res.status(500).send("Server error");
    console.error(error);
  }
}); // get student count for a particular tutor by tutorid

router.get("/student/count/:tutorId", _tutorAuth.default, async (req, res) => {
  const tutorId = req.tutor.id; // check for

  try {
    const studentsCount = await _School.default.find({
      name: "courses",
      createdBy: tutorId
    });
    res.json(studentsCount);
  } catch (error) {
    res.status(500).json({
      errors: error
    });
    console.error(error);
  }
}); // get the report

const getSalesReportPerMonth = async (period, userId) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const year = period.getFullYear();
  const month = period.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month, 30);
  const earning = await _Order.default.aggregate([{
    $match: {
      $and: [{
        boughtfrom: _mongoose.default.Types.ObjectId(userId)
      }, {
        orderdate: {
          $gte: start,
          $lt: end
        }
      }]
    }
  }, {
    $group: {
      _id: null,
      salesTotal: {
        $sum: "$actualearning"
      }
    }
  }]);

  if (earning.length === 0) {
    return {
      label: `${months[month]} ${year}`,
      data: 0
    };
  } else {
    return {
      label: `${months[month]} ${year}`,
      data: earning[0].salesTotal
    };
  }
};

router.get("/sales/report/backdate", _tutorAuth.default, async (req, res) => {
  const userId = req.tutor.id;

  try {
    const [sixthMonth, fifthMonth, fourthMonth, thirdMonth, secondMonth, firstMonth] = (0, _generatePastSixMonths.default)().reverse();
    const labels = [];
    const datas = [];
    await Promise.all([getSalesReportPerMonth(sixthMonth, userId), getSalesReportPerMonth(fifthMonth, userId), getSalesReportPerMonth(fourthMonth, userId), getSalesReportPerMonth(thirdMonth, userId), getSalesReportPerMonth(secondMonth, userId), getSalesReportPerMonth(firstMonth, userId)]).then(values => {
      values.forEach(value => {
        labels.push(value.label);
        datas.push(value.data);
      });
      res.json({
        labels,
        datas
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});
var _default = router;
exports.default = _default;