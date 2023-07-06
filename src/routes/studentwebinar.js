import express from "express";
import School from "../models/School";

import studentAuth from "../middleware/studentAuth";

import StudentWebinar from "../models/StudentWebinar";

const router = express.Router();

// route to get list of purchased student courses
// from a particular school
router.get("/:schoolname", studentAuth, async (req, res) => {
  const schoolname = req.params.schoolname;
  const studentId = req.student.id;

  try {
    const school = await School.findOne({
      name: schoolname,
    });

    if (!school) {
      return res.status(400).json({
        errors: [{ msg: "school not found" }],
      });
    }
    const studentWebinars = await StudentWebinar.find({
      student: studentId,
      boughtfrom: school._id,
    }).populate("webinarBought");

    res.json(studentWebinars);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

export default router;
