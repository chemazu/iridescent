import express from "express";
import cloudinary from "cloudinary";
import { body, validationResult } from "express-validator";
import multer, { memoryStorage } from "multer";
import Course from "../models/Course";
import School from "../models/School";
import Tutor from "../models/Tutor";
import ExchangeRate from "../models/ExchangeRate";
import User from "../models/User";
import PaymentPlans from "../models/PaymentPlans";
import CourseUnit from "../models/CourseUnit";
import auth from "../middleware/auth";
import validateUserPayment from "../middleware/validateUserPayment";
import dataUri from "../utilities/dataUri";
import roundToTwoDecimalPlaces from "../utilities/roundToTwoDecimalPlaces";

const router = express.Router();

const storageDest = memoryStorage();
const createCourseThumbnailPhoto = multer({
  storage: storageDest,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|PNG|JPG|JPEG)$/)) {
      return cb(new Error("Please Upload another video"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/:schoolId",
  [
    auth,
    validateUserPayment,
    createCourseThumbnailPhoto.single("file"),
    body("title", "title is required").not().isEmpty(),
    body("subtitle", "subtitle is required").not().isEmpty(),
    body("category", "category is required").not().isEmpty(),
    body("rootcategory", "root category is required").not().isEmpty(),
    body("description", "description is required").not().isEmpty(),
    body("prerequisite", "prerequisites is required").not().isEmpty(),
    body("language", "language is required").not().isEmpty(),
    body("level", "level is required").not().isEmpty(),
    body("thumbnail", "thumbnail is required").not().isEmpty(),
    body("price", "price is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    if (req.body.price < 5) {
      return res.status(400).json({
        errors: [{ msg: "invalid course price" }],
      });
    }

    const schoolId = req.params.schoolId;
    const userId = req.user.id;
    let foundTutor = null;

    try {
      const validUser = await User.findOne({
        _id: userId,
      });

      const userPaymentPlan = await PaymentPlans.findOne({
        // get infomation on the users payment plan and what he can have access to.
        _id: validUser.selectedplan,
      });

      const coursesCount = await Course.countDocuments({
        // to get the count of courses the user has created
        author: userId,
      });

      // get exchange rate
      const exchangeRate = await ExchangeRate.findOne({
        currencyName: "usd",
      });

      if (userPaymentPlan.coursecount === coursesCount) {
        return res.status(402).json({
          message: "upgrade your plan to upload more courses!",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          errors: [{ msg: "thumbnail file not found" }],
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
        tutorEmail,
      } = req.body;

      let school = await School.findOne({
        _id: schoolId,
      });

      if (!school) {
        return res.status(400).json({
          errors: [{ msg: "school not found" }],
        });
      }

      if (tutorEmail) {
        foundTutor = await Tutor.findOne({
          email: tutorEmail,
        });
      }

      const fileType = `.${
        req.file.originalname.split(".")[
          req.file.originalname.split(".").length - 1
        ]
      }`;
      const imageToBeUploaded = dataUri(`${fileType}`, req.file.buffer).content;
      const uploadResponse = await cloudinary.v2.uploader.upload(
        imageToBeUploaded,
        {
          folder: `tuturly/course/${title.trim()}`,
        }
      );

      let course = new Course({
        title: title.trim(),
        subtitle,
        category,
        rootcategory,
        description,
        prerequisite,
        language,
        level,
        thumbnail: uploadResponse.secure_url,
        price_usd: price,
        price: roundToTwoDecimalPlaces(
          exchangeRate.exchangeRateAmountToNaira * price
        ),
        coursethumbnailid: uploadResponse.public_id,
        transferedToCloudflare: true, // interim key used to keep track of courses that have videos in cloudflare.
        //  before all videos are completely transfered from cloudinary to cloudflare
        author: userId,
        school: schoolId,
        tutor: foundTutor !== null ? foundTutor._id : null,
      });

      await course.save();

      school.courses.unshift(course._id);
      await school.save();

      res.json(course);
    } catch (error) {
      res.status(500).send("server error");
      console.error(error);
    }
  }
);

// code to check if user plan can create new course
// when create new course button is clicked
router.get("/user/createcourse", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const validUser = await User.findOne({
      _id: userId,
    });

    const userPaymentPlan = await PaymentPlans.findOne({
      // get infomation on the users payment plan and what he can have access to.
      _id: validUser.selectedplan, // the user's subscription plans
    });

    const coursesCount = await Course.countDocuments({
      // to get the count of courses the user has created
      author: userId,
    });

    if (userPaymentPlan.coursecount === coursesCount) {
      return res.status(402).json({
        message: "upgrade your plan to upload more courses!",
      });
    }

    res.status(200).send("done.");
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
});

// route to get specific course by courseId
router.get("/:courseId", async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.courseId }).populate(
      "author"
    );
    if (!course) {
      return res.status(400).json({
        errors: [{ msg: "course not found" }],
      });
    }
    res.json(course);
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
});

// route to get all courses by school
router.get("/school/:schoolId", auth, async (req, res) => {
  try {
    const courses = await Course.find({
      school: req.params.schoolId,
    }).populate("author");
    res.json(courses);
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
});

// route to get all courses by author
router.get("/author/:authorId", auth, async (req, res) => {
  try {
    const courses = await Course.find({
      author: req.params.authorId,
    });
    res.json(courses);
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
});

// route to update course by id
router.put("/:courseId", auth, validateUserPayment, async (req, res) => {
  const courseId = req.params.courseId;
  try {
    let course = await Course.findOne({ _id: courseId });
    if (!course) {
      return res.status(404).json({
        errors: [{ msg: "course not found" }],
      });
    }

    // get exchange rate
    const exchangeRate = await ExchangeRate.findOne({
      currencyName: "usd",
    });

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
      coursediscount,
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
    if (price) {
      course.price_usd = price;
      course.price = roundToTwoDecimalPlaces(
        exchangeRate.exchangeRateAmountToNaira * price
      );
    }
    if (coursediscount) course.coursediscount = coursediscount;

    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
});

const storageDestForThumnailUpload = memoryStorage();
const thumbUploadHandler = multer({
  storage: storageDestForThumnailUpload,
  fileFilter(req, file, cb) {
    if (file.mimetype.includes("image")) {
      cb(null, true);
    } else {
      cb({ message: "Unsupported file format" }, false);
    }
  },
});

// route to update course thumbnail
router.put(
  "/:courseId/thumbnail",
  auth,
  validateUserPayment,
  thumbUploadHandler.single("thumbnail"),
  async (req, res) => {
    const courseId = req.params.courseId;
    if (!req.file) {
      return res.status(400).json({
        errors: [{ msg: "image file not found" }],
      });
    }

    try {
      const course = await Course.findOne({
        _id: courseId,
      });

      if (!course) {
        return res.status(400).json({
          errors: [{ msg: "course not found" }],
        });
      }

      // delete previous thumbnail by course thumbnail id
      await cloudinary.v2.uploader.destroy(course.coursethumbnailid);

      const fileType = `.${
        req.file.originalname.split(".")[
          req.file.originalname.split(".").length - 1
        ]
      }`;
      const imageToBeUploaded = dataUri(`${fileType}`, req.file.buffer).content;
      const uploadResponse = await cloudinary.v2.uploader.upload(
        imageToBeUploaded,
        {
          folder: `tuturly/course/${course.title}`,
        }
      );

      course.thumbnail = uploadResponse.secure_url;
      course.coursethumbnailid = uploadResponse.public_id;
      await course.save();
      res.json(course);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  }
);

router.put(
  "/review/:courseId",
  auth,
  validateUserPayment,
  [body("comment", "comment is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const courseId = req.params.courseId;
    const { comment, star } = req.body;
    try {
      let course = await Course.findOne({ _id: courseId });

      if (!course) {
        return res.status(400).json({
          errors: [
            {
              msg: "invalid course",
            },
          ],
        });
      }

      const user = await User.findOne({ _id: req.user.id });
      let userReview = {
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
        comment,
        date: Date.now(),
      };

      if (star) userReview.star = star;

      if (
        course.reviews.filter(
          (review) =>
            review.email.toString().toLowerCase() === user.email.toLowerCase()
        ).length > 0
      ) {
        return res.status(400).json({
          errors: [
            {
              msg: "user review already exists",
            },
          ],
        });
      }

      course.reviews.unshift(userReview);
      await course.save();
      res.json(course);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  }
);

// route to remove review from course
router.put(
  "/review/:courseId/:reviewId",
  auth,
  validateUserPayment,
  async (req, res) => {
    try {
      let course = await Course.findOne({ _id: req.params.courseId });

      if (!course) {
        return res.status(400).json({
          errors: [
            {
              msg: "invalid course",
            },
          ],
        });
      }

      course.reviews = course.reviews.filter(
        (review) => review._id === req.params.reviewId
      );

      await course.save();
      res.json(course);
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  }
);

// route to delete course by ID
router.delete("/:courseId", auth, validateUserPayment, async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.courseId });
    if (!course) {
      return res.status(400).json({
        errors: [{ msg: "course not found" }],
      });
    }
    await course.remove();
    res.json(course);
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
});

// route to update publish status course by id
router.put(
  "/publish/:courseId",
  auth,
  validateUserPayment,
  async (req, res) => {
    const courseId = req.params.courseId;
    try {
      const course = await Course.findOne({ _id: courseId });
      if (!course) {
        return res.status(404).json({
          errors: [{ msg: "course not found" }],
        });
      }

      // check if course has units/videos that are still processing
      const courseUnits = await CourseUnit.find({
        isStreamReady: false,
        course: course._id,
      });

      if (courseUnits.length > 0) {
        return res.status(400).json({
          errors: [{ msg: "your course video's are still processing" }],
        });
      }

      course.published = true;

      await course.save();
      res.json(course);
    } catch (error) {
      res.status(500).send("server error");
      console.error(error);
    }
  }
);

// route to update course retract status
router.put(
  "/retract/:courseId",
  auth,
  validateUserPayment,
  async (req, res) => {
    const courseId = req.params.courseId;
    try {
      let course = await Course.findOne({ _id: courseId });
      if (!course) {
        return res.status(404).json({
          errors: [{ msg: "course not found" }],
        });
      }

      course.published = false;

      await course.save();
      res.json(course);
    } catch (error) {
      res.status(500).send("server error");
      console.error(error);
    }
  }
);

router.get("/count/:authorId", auth, async (req, res) => {
  try {
    const coursesCount = await Course.countDocuments({
      author: req.params.authorId,
    });
    res.json(coursesCount);
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
});

router.get("/courses/explore", async (req, res) => {
  const { page, size, titleQuery, categoryQuery } = req.query;

  const limit = parseInt(size);
  const skip = parseInt(page - 1) * size;

  const titleRegex = new RegExp(titleQuery, "i");
  const categoryRegex = new RegExp(categoryQuery, "i");

  try {
    const courses = await Course.find({
      title: { $regex: titleRegex },
      category: { $regex: categoryRegex },
      is_verified: true,
    })
      .populate("author", ["firstname", "lastname", "username"])
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

export default router;
