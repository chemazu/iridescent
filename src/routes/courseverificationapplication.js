import express from "express";
import { body, validationResult } from "express-validator";
import CourseVerificationApplication from "../models/CourseVerificationApplication";
import Course from "../models/Course";
import CourseChapter from "../models/CourseChapter";
import CourseUnit from "../models/CourseUnit";
import User from "../models/User";
import validateAdminRoute from "../middleware/validateAdminRoute";
import auth from "../middleware/auth";

import { notifyAdminOnCourseVerificationRequest } from "../emails/notifications/admin";
import {
  emailNotificationForCourseVerification,
  emailNotificationForCourseVerificationCompleted,
  emailNotificationForCourseRejected,
} from "../emails/notifications/tutuor";

const router = express.Router();

router.post(
  "/",
  body("courseId", "course id not valid").not().isEmpty(),
  body("title", "title not found").not().isEmpty(),
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const { courseId, title } = req.body;

    try {
      const courseChapterCount = await CourseChapter.countDocuments({
        course: courseId,
      });

      const courseUnitCount = await CourseUnit.countDocuments({
        course: courseId,
      });

      if (courseChapterCount < 1 || courseUnitCount < 1) {
        return res.status(400).send({
          errors: [
            {
              msg: "course content does not have enough content to post on explore.",
            },
          ],
        });
      }

      const userRequest = await User.findOne({
        _id: req.user.id,
      });

      const admins = await User.find({
        user_type: "admin",
      });

      const courseToVerify = await Course.findOne({
        _id: courseId,
      });

      if (courseToVerify.verification_in_review === true) {
        return res.status(400).json({
          errors: [{ msg: "course verification in progress." }],
        });
      }

      if (courseToVerify.is_verified === true) {
        return res.status(400).json({
          errors: [{ msg: "course has been verified." }],
        });
      }

      const newCourseVerification = new CourseVerificationApplication({
        course_id: courseId,
        title: title,
        course_author: req.user.id,
      });

      courseToVerify.verification_in_review = true;

      await courseToVerify.save();
      await newCourseVerification.save();

      // notify user of request
      await emailNotificationForCourseVerification(userRequest.email);
      // notify admins of request
      admins.forEach(async (admin) => {
        const courseDetails = {
          validationRequestId: newCourseVerification._id,
          courseTitle: title,
        };
        const userDetails = {
          firstname: userRequest.firstname,
          lastname: userRequest.lastname,
          username: userRequest.username,
        };
        await notifyAdminOnCourseVerificationRequest(
          admin.email,
          courseDetails,
          userDetails
        );
      });

      res.json(newCourseVerification);
    } catch (error) {
      res.status(500).json({ msg: "error processing request" });
      console.log(error);
    }
  }
);

router.get(
  "/:courseVerificationId",
  auth,
  validateAdminRoute,
  async (req, res) => {
    const courseVerificationId = req.params.courseVerificationId;
    try {
      const courseVerification = await CourseVerificationApplication.findOne({
        _id: courseVerificationId,
      })
        .populate("course_id")
        .populate("course_author", ["firstname", "lastname"]);
      res.json(courseVerification);
    } catch (error) {
      res.status(500).json({ msg: "error processing request" });
      console.log(error);
    }
  }
);

router.get("/status/unverified", auth, validateAdminRoute, async (req, res) => {
  try {
    const courseVerifications = await CourseVerificationApplication.find({
      is_verified: false,
    })
      .populate("course_id", ["title", "thumbnail", "price"])
      .populate("course_author", ["firstname", "lastname"]);
    res.json(courseVerifications);
  } catch (error) {
    res.status(500).json({ msg: "error processing request" });
    console.log(error);
  }
});

router.get("/status/verified", auth, validateAdminRoute, async (req, res) => {
  try {
    const courseVerifications = await CourseVerificationApplication.find({
      is_verified: true,
    })
      .populate("course_id", ["title", "thumbnail", "price"])
      .populate("course_author", ["firstname", "lastname"]);
    res.json(courseVerifications);
  } catch (error) {
    res.status(500).json({ msg: "error processing request" });
    console.log(error);
  }
});

// route to mark a course as verified
router.put(
  "/:courseVerificationId",
  auth,
  validateAdminRoute,
  async (req, res) => {
    const courseVerificationId = req.params.courseVerificationId;
    try {
      const courseVerificationRecord =
        await CourseVerificationApplication.findOne({
          _id: courseVerificationId,
        });

      if (!courseVerificationRecord) {
        return res.json({
          errors: [{ msg: "resource not found." }],
        });
      }

      const userRequest = await User.findOne({
        _id: courseVerificationRecord.course_author,
      });

      const course = await Course.findOne({
        _id: courseVerificationRecord.course_id,
      });

      course.is_verified = true;
      course.verification_in_review = false;
      courseVerificationRecord.verified_by = req.user.id;
      courseVerificationRecord.is_verified = true;

      await course.save();
      await courseVerificationRecord.save();

      await emailNotificationForCourseVerificationCompleted(userRequest.email);
      res.json(courseVerificationRecord);
    } catch (error) {
      res.status(500).json({ msg: "error processing request" });
      console.log(error);
    }
  }
);

// route to reject a course as verified
router.put(
  "/reject/:courseVerificationId",
  body("reason", "Rejection must have a reason").not().isEmpty(),
  auth,
  validateAdminRoute,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const courseVerificationId = req.params.courseVerificationId;
    const { reason } = req.body;
    try {
      const courseVerificationRecord =
        await CourseVerificationApplication.findOne({
          _id: courseVerificationId,
        }).populate("course_author", ["email"]);

      if (!courseVerificationRecord) {
        return res.json({
          errors: [{ msg: "resource not found." }],
        });
      }

      const course = await Course.findOne({
        _id: courseVerificationRecord.course_id,
      });

      course.verification_in_review = false;
      await course.save();
      await courseVerificationRecord.remove();

      await emailNotificationForCourseRejected(
        courseVerificationRecord.course_author.email,
        reason
      );
      res.json(courseVerificationRecord);
    } catch (error) {
      res.status(500).json({ msg: "error processing request" });
      console.log(error);
    }
  }
);

export default router;
