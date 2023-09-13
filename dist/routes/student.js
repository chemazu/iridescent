"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _gravatar = _interopRequireDefault(require("gravatar"));

var _expressValidator = require("express-validator");

var _School = _interopRequireDefault(require("../models/School"));

var _Student = _interopRequireDefault(require("../models/Student"));

var _studentAuth = _interopRequireDefault(require("../middleware/studentAuth"));

var _tutuor = require("../emails/notifications/tutuor");

var _student = require("../emails/notifications/student");

var _student2 = require("../emails/password reset/student");

var _Notifications = _interopRequireDefault(require("../models/Notifications"));

var _auth = _interopRequireDefault(require("../middleware/auth"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

const studentTokenSecret = process.env.STUDENTTOKENSECRET;
router.get("/active", _studentAuth.default, async (req, res) => {
  try {
    const studentId = req.student.id;
    const student = await _Student.default.findOne({
      _id: studentId
    }).select("-password");

    if (!student) {
      return res.status(404).json({
        errors: [{
          msg: "student not found"
        }]
      });
    }

    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).send("internal server error");
  }
});
router.post("/signup/:schoolName", (0, _expressValidator.body)("firstname", "firstname is required").not().isEmpty(), (0, _expressValidator.body)("lastname", "lastname is required").not().isEmpty(), (0, _expressValidator.body)("email", "please include a valid email").isEmail(), (0, _expressValidator.body)("username", "username is required").not().isEmpty(), (0, _expressValidator.body)("password", "Please enter a password with 6 or more characters").isLength({
  min: 6
}), async (req, res) => {
  const schoolName = req.params.schoolName;

  try {
    const errors = (0, _expressValidator.validationResult)(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    let school = await _School.default.findOne({
      name: schoolName
    }).populate("createdBy", ["email"]);

    if (!school) {
      return res.status(400).json({
        errors: [{
          msg: "school not found"
        }]
      });
    }

    const {
      firstname,
      lastname,
      email,
      password,
      username
    } = req.body;
    let student = await _Student.default.findOne({
      email: email.toLowerCase(),
      enrolledTo: school._id
    });

    if (student) {
      return res.status(400).json({
        errors: [{
          msg: "student enrollment already exist's"
        }]
      });
    }

    let studentUsernameExits = await _Student.default.findOne({
      username,
      enrolledTo: school._id
    });

    if (studentUsernameExits) {
      return res.status(400).json({
        errors: [{
          msg: "username already taken"
        }]
      });
    }

    const avatar = _gravatar.default.url(email, {
      s: "250",
      r: "pg",
      d: "mm"
    });

    student = new _Student.default({
      firstname,
      lastname,
      email: email.toLowerCase(),
      username,
      password,
      avatar,
      enrolledTo: school._id
    });
    const salt = await _bcryptjs.default.genSalt(10); // generate salt for password

    student.password = await _bcryptjs.default.hash(password, salt); // use salt to hash password

    school.erolledstudent.push(student._id); // student as ID for school's new enrollment

    await student.save();
    await school.save(); // create new notification for tutor and send email
    //  about enrollment

    (0, _tutuor.studentEnrolledNotification)(school.createdBy.email, `${firstname} ${lastname}`);
    const notification = new _Notifications.default({
      user: school.createdBy._id,
      message: `${firstname} ${lastname} enrolled in your school`,
      title: `${firstname}`,
      type: "student enrollment"
    });
    notification.save(); // send off welcome email to student

    (0, _student.welcomeToSchool)(email, school.name); // code to create token payload

    const payload = {
      student: {
        id: student._id
      }
    };

    _jsonwebtoken.default.sign(payload, studentTokenSecret, {
      expiresIn: 360000
    }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        student
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("internal server error");
  }
});
router.post("/signin/:schoolname", (0, _expressValidator.body)("email", "please include a valid email").isEmail(), (0, _expressValidator.body)("password", "Please enter a password").exists(), async (req, res) => {
  const schoolname = req.params.schoolname;
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.json({
      errors: errors.array()
    });
  }

  let school = await _School.default.findOne({
    name: schoolname
  });

  if (!school) {
    return res.status(400).json({
      errors: [{
        msg: "school not found"
      }]
    });
  }

  const {
    email,
    password
  } = req.body;

  try {
    let student = await _Student.default.findOne({
      email: email.toLowerCase(),
      enrolledTo: school._id
    });

    if (!student) {
      return res.status(400).json({
        errors: [{
          msg: "invalid credentials"
        }]
      });
    }

    const isMatch = await _bcryptjs.default.compare(password, student.password);

    if (!isMatch) {
      return res.status(400).json({
        errors: [{
          msg: "invalid credentials"
        }]
      });
    } // code to create token payload


    const payload = {
      student: {
        id: student._id
      }
    };

    _jsonwebtoken.default.sign(payload, studentTokenSecret, {
      expiresIn: 360000
    }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        student
      });
    });
  } catch (error) {
    res.status(500).json({
      errors: error
    });
    console.error(error);
  }
});
router.get("/count/:schoolId", _auth.default, async (req, res) => {
  const schoolId = req.params.schoolId;

  try {
    const studentsCount = await _Student.default.countDocuments({
      enrolledTo: schoolId
    });
    res.json(studentsCount);
  } catch (error) {
    res.status(500).json({
      errors: error
    });
    console.error(error);
  }
});
router.get("/password/reset/:emailAddress", async (req, res) => {
  const userEmail = req.params.emailAddress;

  try {
    const student = await _Student.default.findOne({
      email: userEmail
    }).populate("enrolledTo", ["name"]);

    if (student) {
      const payload = {
        student: {
          id: student._id
        }
      };
      const token = await _jsonwebtoken.default.sign(payload, studentTokenSecret, {
        expiresIn: "24h"
      });
      await (0, _student2.sendStudentPasswordResetLink)(student.email, student.enrolledTo.name, token);
    }

    res.status(200).send("done.");
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error);
  }
});
router.get(`/password/token/:token`, async (req, res) => {
  const token = req.params.token;

  try {
    const decoded = await _jsonwebtoken.default.verify(token, studentTokenSecret);
    res.json(decoded.student);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      msg: "Token is not valid"
    });
  }
});
router.put("/password/change/:studentId", [(0, _expressValidator.body)("password", "password not found").not().isEmpty(), (0, _expressValidator.body)("confirmpassword", "confirm password not found").not().isEmpty()], async (req, res) => {
  const studentId = req.params.studentId;
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const {
    password,
    confirmpassword
  } = req.body;

  if (password !== confirmpassword) {
    return res.status(400).json({
      errors: [{
        msg: "passwords do not match."
      }]
    });
  }

  try {
    const student = await _Student.default.findOne({
      _id: studentId
    });
    const salt = await _bcryptjs.default.genSalt(10); // generate salt for password

    student.password = await _bcryptjs.default.hash(password, salt); // use salt to hash password

    await student.save();
    res.status(200).send("done.");
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error);
  }
});
var _default = router;
exports.default = _default;