import express from "express";
import StudentNotificationUpdate from "../models/StudentNotificationUpdate";
import studentAuth from "../middleware/studentAuth";

const router = express.Router();

// route to read user notification update
// it also create's on just for user's that don't have
// a notifications update already...
router.get("/", studentAuth, async (req, res) => {
  const studentId = req.student?.id;
  try {
    const notificationUpdate = await StudentNotificationUpdate.findOne({
      student: studentId,
    });

    if (notificationUpdate === null) {
      const newNotificationUpdate = new StudentNotificationUpdate({
        student: studentId,
        count: 0,
        inView: false,
      });

      await newNotificationUpdate.save();
      return res.json(newNotificationUpdate);
    }

    res.json(notificationUpdate);
  } catch (error) {
    res.status(500).json({
      errors: error,
    });
    console.error(error);
  }
});

// route to update notification update
// when notification page displays
// changes the inView prop to false
router.put("/", studentAuth, async (req, res) => {
  const studentId = req.student.id;
  try {
    const notificationUpdate = await StudentNotificationUpdate.findOne({
      student: studentId,
    });

    notificationUpdate.inView = false;
    notificationUpdate.count = 0;

    await notificationUpdate.save();
    res.json(notificationUpdate);
  } catch (error) {
    res.status(500).json({
      errors: error,
    });
    console.error(error);
  }
});

export default router;
