import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import { body, validationResult } from "express-validator";
import School from "../models/School";
import Student from "../models/Student";
import studentAuth from "../middleware/studentAuth";
import { studentEnrolledNotification } from "../emails/notifications/tutuor";
import { welcomeToSchool } from "../emails/notifications/student";
import { sendStudentPasswordResetLink } from "../emails/password reset/student";
import Notification from "../models/Notifications";
import auth from "../middleware/auth";

const router = express.Router();
const studentTokenSecret = process.env.STUDENTTOKENSECRET;

router.get("/active", studentAuth, async (req, res) => {
  try {
    const studentId = req.student.id;
    const student = await Student.findOne({
      _id: studentId,
    }).select("-password");
    if (!student) {
      return res.status(404).json({ errors: [{ msg: "student not found" }] });
    }
    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).send("internal server error");
  }
});

router.post(
  "/signup/:schoolName",
  body("firstname", "firstname is required").not().isEmpty(),
  body("lastname", "lastname is required").not().isEmpty(),
  body("email", "please include a valid email").isEmail(),
  body("username", "username is required").not().isEmpty(),
  body(
    "password",
    "Please enter a password with 6 or more characters"
  ).isLength({ min: 6 }),
  async (req, res) => {
    const schoolName = req.params.schoolName;
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
        });
      }
      let school = await School.findOne({
        name: schoolName,
      }).populate("createdBy", ["email"]);

      if (!school) {
        return res.status(400).json({
          errors: [{ msg: "school not found" }],
        });
      }
      const { firstname, lastname, email, password, username } = req.body;
      let student = await Student.findOne({
        email: email.toLowerCase(),
        enrolledTo: school._id,
      });

      if (student) {
        return res
          .status(400)
          .json({ errors: [{ msg: "student enrollment already exist's" }] });
      }

      let studentUsernameExits = await Student.findOne({
        username,
        enrolledTo: school._id,
      });

      if (studentUsernameExits) {
        return res
          .status(400)
          .json({ errors: [{ msg: "username already taken" }] });
      }

      const avatar = gravatar.url(email, {
        s: "250",
        r: "pg",
        d: "mm",
      });

      student = new Student({
        firstname,
        lastname,
        email: email.toLowerCase(),
        username,
        password,
        avatar,
        enrolledTo: school._id,
      });

      const salt = await bcrypt.genSalt(10); // generate salt for password
      student.password = await bcrypt.hash(password, salt); // use salt to hash password
      school.erolledstudent.push(student._id); // student as ID for school's new enrollment

      await student.save();
      await school.save();

      // create new notification for tutor and send email
      //  about enrollment
      studentEnrolledNotification(
        school.createdBy.email,
        `${firstname} ${lastname}`
      );
      const notification = new Notification({
        user: school.createdBy._id,
        message: `${firstname} ${lastname} enrolled in your school`,
        title: `${firstname}`,
        type: "student enrollment",
      });

      notification.save();

      // send off welcome email to student
      welcomeToSchool(email, school.name);

      // code to create token payload
      const payload = {
        student: {
          id: student._id,
        },
      };

      jwt.sign(
        payload,
        studentTokenSecret,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            student,
          });
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).send("internal server error");
    }
  }
);

router.post(
  "/signin/:schoolname",
  body("email", "please include a valid email").isEmail(),
  body("password", "Please enter a password").exists(),
  async (req, res) => {
    const schoolname = req.params.schoolname;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        errors: errors.array(),
      });
    }

    let school = await School.findOne({
      name: schoolname,
    });

    if (!school) {
      return res.status(400).json({
        errors: [{ msg: "school not found" }],
      });
    }

    const { email, password } = req.body;
    try {
      let student = await Student.findOne({
        email: email.toLowerCase(),
        enrolledTo: school._id,
      });
      if (!student) {
        return res.status(400).json({
          errors: [{ msg: "invalid credentials" }],
        });
      }

      const isMatch = await bcrypt.compare(password, student.password);

      if (!isMatch) {
        return res.status(400).json({
          errors: [{ msg: "invalid credentials" }],
        });
      }

      // code to create token payload
      const payload = {
        student: {
          id: student._id,
        },
      };

      jwt.sign(
        payload,
        studentTokenSecret,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            student,
          });
        }
      );
    } catch (error) {
      res.status(500).json({
        errors: error,
      });
      console.error(error);
    }
  }
);

router.get("/count/:schoolId", auth, async (req, res) => {
  const schoolId = req.params.schoolId;
  try {
    const studentsCount = await Student.countDocuments({
      enrolledTo: schoolId,
    });
    res.json(studentsCount);
  } catch (error) {
    res.status(500).json({
      errors: error,
    });
    console.error(error);
  }
});

router.get("/password/reset/:emailAddress", async (req, res) => {
  const userEmail = req.params.emailAddress;
  try {
    const student = await Student.findOne({
      email: userEmail,
    }).populate("enrolledTo", ["name"]);

    if (student) {
      const payload = {
        student: {
          id: student._id,
        },
      };

      const token = await jwt.sign(payload, studentTokenSecret, {
        expiresIn: "24h",
      });

      await sendStudentPasswordResetLink(
        student.email,
        student.enrolledTo.name,
        token
      );
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
    const decoded = await jwt.verify(token, studentTokenSecret);
    res.json(decoded.student);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      msg: "Token is not valid",
    });
  }
});

router.put(
  "/password/change/:studentId",
  [
    body("password", "password not found").not().isEmpty(),
    body("confirmpassword", "confirm password not found").not().isEmpty(),
  ],
  async (req, res) => {
    const studentId = req.params.studentId;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { password, confirmpassword } = req.body;

    if (password !== confirmpassword) {
      return res
        .status(400)
        .json({ errors: [{ msg: "passwords do not match." }] });
    }

    try {
      const student = await Student.findOne({
        _id: studentId,
      });

      const salt = await bcrypt.genSalt(10); // generate salt for password
      student.password = await bcrypt.hash(password, salt); // use salt to hash password
      await student.save();
      res.status(200).send("done.");
    } catch (error) {
      res.status(500).send("Server Error");
      console.log(error);
    }
  }
);

export default router;
