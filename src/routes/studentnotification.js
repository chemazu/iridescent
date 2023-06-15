import express from "express";
import StudentNotification from "../models/StudentNotification";

import studentAuth from "../middleware/studentAuth";

const router = express.Router();

// route to get notifications by page
router.get("/", studentAuth, async (req, res) => {
  const { page, size } = req.query;

  const limit = parseInt(size);
  const skip = parseInt(page - 1) * parseInt(size);

  try {
    const studentId = req.student.id;
    const studentNotifications = await StudentNotification.find(
      {
        student: studentId,
      },
      {},
      {
        skip: skip,
        limit: limit,
      }
    ).sort({
      date: -1,
    });

    const docsCount = await StudentNotification.countDocuments({
      student: studentId,
    });

    res.json({
      studentNotifications,
      docsCount,
    });
  } catch (error) {
    res.status(500).send("server error");
  }
});

export default router;
