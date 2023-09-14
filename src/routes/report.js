import express from "express";
import { body, validationResult } from "express-validator";
import Report from "../models/Report";
import School from "../models/School";
import CourseUnit from "../models/CourseUnit";
import auth from "../middleware/auth";
import studentAuth from "../middleware/studentAuth";

const router = express.Router();

// route to create a new report
// private route
router.post(
  "/",
  studentAuth,
  [
    body("schoolid", "school ID not found").not().isEmpty(),
    body("course", "course ID not found").not().isEmpty(),
    body("courseunitid", "courseunit ID not found").not().isEmpty(),
    body("reason", "reason cannot be empty").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { schoolid, course, courseunitid, reason, description } = req.body;
    const studentId = req.student.id;

    try {
      const school = await School.findOne({
        _id: schoolid,
      });
      if (!school) {
        return res.status(400).json({
          errors: [
            {
              msg: "school not found",
            },
          ],
        });
      }
      const courseUnit = await CourseUnit.findOne({
        _id: courseunitid,
      });
      if (!courseUnit) {
        return res.status(400).json({
          errors: [
            {
              msg: "courseunit not found",
            },
          ],
        });
      }
      const reportObj = {
        school: schoolid,
        course: course,
        courseunitid: courseunitid,
        tutuor: school.createdBy,
        reason: reason,
        student: studentId,
      };
      if (description) {
        reportObj["description"] = description;
      }
      const newReport = new Report(reportObj);
      await newReport.save();
      res.json(newReport);
    } catch (error) {
      console.error(error);
      res.status(500).send("server error");
    }
  }
);

// Router to get a single route by RouteID
router.get("/:reportId", auth, async (req, res) => {
  const reportId = req.params.reportId;
  try {
    const report = await Report.findOne({
      _id: reportId,
    });
    if (!report) {
      return res.status(400).json({
        errors: [
          {
            msg: "school not found",
          },
        ],
      });
    }
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

// Route to get all Reports by reports
router.get("/", auth, async (req, res) => {
  const { page, size } = req.query;

  const limit = parseInt(size);
  const skip = parseInt(page - 1) * size;

  try {
    const reports = Report.find();
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

export default router;
