import express from "express";
import mongoose from "mongoose";
import { body, validationResult } from "express-validator";
import gravatar from "gravatar";
import bcrypt from "bcryptjs";
import Tutor from "../models/Tutor";
import School from "../models/School";
import Product from "../models/Product";
import Course from "../models/Course";
import CourseUnit from "../models/CourseUnit";
import CourseChapter from "../models/CourseChapter";
import tutorAuth from "../middleware/tutorAuth";
import Order from "../models/Order";
import auth from "../middleware/auth";
import validateAdminRoute from "../middleware/validateAdminRoute";
import jwt from "jsonwebtoken";
import Student from "../models/Student";
import generatePastSixMonths from "../utilities/generatePastSixMonths";


const router = express.Router();
const tokenSecret = process.env.JWTSECRET;

router.post(
  "/",
  [
    body("firstname", "firstname not valid").not().isEmpty(),
    body("lastname", "lasname not valid").not().isEmpty(),
    body("email", "email not valid").isEmail(),
    body(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    try {
      const { firstname, lastname, email, password } = req.body;

      const existingTutor = await Tutor.findOne({
        email: email,
      });

      if (existingTutor) {
        return res
          .status(400)
          .json({ errors: [{ msg: "user already exist's" }] });
      }

      const avatar = gravatar.url(email, {
        s: "250",
        r: "pg",
        d: "mm",
      });
      const salt = await bcrypt.genSalt(10); // generate salt for password
      const tutor = new Tutor({
        firstname,
        lastname,
        email,
        avatar,
        password: await bcrypt.hash(password, salt),
      });
      await tutor.save();

      const payload = {
        tutor: {
          id: tutor._id,
        },
      };

      jwt.sign(payload, tokenSecret, { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        const newUserData = Object.assign(tutor.toObject(), {});
        delete newUserData.password;
        res.json({
          token,
          tutor: newUserData,
        });
      });
    } catch (error) {
      res.status(500).send("server error");
      console.error(error);
    }
  }
);

// route to get school courses by school name
router.get("/courses/:schoolname", async (req, res) => {
  const schoolname = req.params.schoolname;
  try {
    const school = await School.findOne({
      name: schoolname,
    });
    if (!school) {
      return res.status(404).json({
        errors: [
          {
            msg: "school not found",
          },
        ],
      });
    }
    const courses = await Course.find({
      school: school._id,
      published: true,
    }).populate("tutor");
    res.json(courses);
  } catch (error) {
    console.log(error);
    res.status(500).send("server error");
  }
});

// route to get school products by school name
router.get("/products/:schoolname", async (req, res) => {
  const schoolname = req.params.schoolname;
  try {
    const school = await School.findOne({
      name: schoolname,
    });
    if (!school) {
      return res.status(404).json({
        errors: [
          {
            msg: "school not found",
          },
        ],
      });
    }
    const products = await Product.find({
      school: school._id,
      published: true,
    }).populate("tutor");
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).send("server error");
  }
});

// route to get course details for the tutors.courses subdomain page
router.get("/course/:courseId", async (req, res) => {
  const courseId = req.params.courseId;

  try {
    const course = await Course.findOne({
      _id: courseId,
    }).populate("coursechapters");

    const courseUnitsInCourse = await CourseUnit.find({
      course: course._id,
    });

    const courseChapterCount = await CourseChapter.countDocuments({
      course: course._id,
    });

    const durationSum = courseUnitsInCourse.reduce((prev, curr) => {
      return Number(prev) + Number(curr.duration);
    }, 0);

    res.json({
      course,
      courseduration: durationSum,
      episodes: courseChapterCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// route to get course Modules by CourseId
router.get("/course/modules/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const courseChapters = await CourseChapter.find({
      course: courseId,
    }).populate("courseunit");

    res.json(courseChapters);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// route to get logged in tutor in tutor dashboard
router.get("/me", tutorAuth, async (req, res) => {
  try {
    const tutorId = req.tutor.id;
    const tutor = await Tutor.findById(tutorId).select("-password");

    if (!tutor) {
      return res.status(404).json({ errors: [{ msg: "tutor not found" }] });
    }

    res.json(tutor);
  } catch (error) {
    console.error(error);
    res.status(500).send("internal server error");
  }
});

// route to get specific product by productID
// schoolname is searched to ensure valid school is used
router.get("/product/:productId", async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findOne({ _id: productId });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

router.post(
  "/login",
  body("email", "please include a valid email").isEmail(),
  body("password", "Please enter a password").exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        errors: errors.array(),
      });
    }
    const { email, password } = req.body;
    try {
      const tutor = await Tutor.findOne({ email: email });
      if (!tutor) {
        return res.status(400).json({
          errors: [{ msg: "invalid credentials" }],
        });
      }

      const isMatch = await bcrypt.compare(password, tutor.password);

      if (!isMatch) {
        return res.status(400).json({
          errors: [{ msg: "invalid credentials" }],
        });
      }

      // code to create token payload
      const payload = {
        tutor: {
          id: tutor._id,
        },
      };

      jwt.sign(payload, tokenSecret, { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        const newUserData = Object.assign(tutor.toObject(), {});
        delete newUserData.password;
        res.json({
          token,
          tutor: newUserData,
        });
      });
    } catch (error) {
      res.status(500).send("Server error");
      console.error(error);
    }
  }
);
// get student count for a particular tutor by tutorid

router.get("/student/count/:tutorId", tutorAuth, async (req, res) => {
  const tutorId = req.tutor.id
 
  // check for
  try {
    const studentsCount = await School.find({
      name: "courses",
      createdBy: tutorId,
    });

    res.json(studentsCount);
  } catch (error) {
    res.status(500).json({
      errors: error,
    });
    console.error(error);
  }
});
// get the report
const getSalesReportPerMonth = async (period, userId) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const year = period.getFullYear();
  const month = period.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month, 30);

  const earning = await Order.aggregate([
    {
      $match: {
        $and: [
          { boughtfrom: mongoose.Types.ObjectId(userId) },
          { orderdate: { $gte: start, $lt: end } },
        ],
      },
    },
    {
      $group: {
        _id: null,
        salesTotal: {
          $sum: "$actualearning",
        },
      },
    },
  ]);
  if (earning.length === 0) {
    return {
      label: `${months[month]} ${year}`,
      data: 0,
    };
  } else {
    return {
      label: `${months[month]} ${year}`,
      data: earning[0].salesTotal,
    };
  }
};
router.get("/sales/report/backdate", tutorAuth, async (req, res) => {
  const userId = req.tutor.id;
  try {
    const [
      sixthMonth,
      fifthMonth,
      fourthMonth,
      thirdMonth,
      secondMonth,
      firstMonth,
    ] = generatePastSixMonths().reverse();
    const labels = [];
    const datas = [];

    await Promise.all([
      getSalesReportPerMonth(sixthMonth, userId),
      getSalesReportPerMonth(fifthMonth, userId),
      getSalesReportPerMonth(fourthMonth, userId),
      getSalesReportPerMonth(thirdMonth, userId),
      getSalesReportPerMonth(secondMonth, userId),
      getSalesReportPerMonth(firstMonth, userId),
    ]).then((values) => {
      values.forEach((value) => {
        labels.push(value.label);
        datas.push(value.data);
      });
      res.json({
        labels,
        datas,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

export default router;
