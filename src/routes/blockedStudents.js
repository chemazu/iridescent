import { Router } from "express";
import BlockedStudent from "../models/BlockedStudent";
import auth from "../middleware/auth";

const router = Router();
router.post("/blocked-students", [auth], async (req, res) => {
  try {
    console.log(req.body);

    const { studentId, blockType, visitorID, roomId } = req.body;
    const blockedBy = req.user.id;
    const blockedStudent = new BlockedStudent({
      studentId,
      blockedBy,
      blockType,
      visitorID,
      roomId,
    });

    await blockedStudent.save();
    res.status(201).json(blockedStudent);
  } catch (error) {
    console.error("Error creating a blocked student:", error);
    res.status(500).json({ error: "Unable to block a  student" });
  }
});
router.get("/blocked-students", [auth], async (req, res) => {
  try {
    const blockedBy = req.user.id;

    const blockedStudents = await BlockedStudent.find({ blockedBy });
    res.json(blockedStudents);
    // console.log(blockedStudents);
  } catch (error) {
    console.error("Error fetching blocked students:", error);
    res.status(500).json({ error: "Unable to retrieve blocked students" });
  }
});

router.get("/purge", async (req, res) => {
  await BlockedStudent.deleteMany({});

  res.json("all records deleted");
});
export default router;
