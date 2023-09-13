import express from "express";
import School from "../models/School";
import StudentProduct from "../models/StudentProduct";
import studentAuth from "../middleware/studentAuth";

const router = express.Router();

// route to get list of purchased student products
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

    const studentProducts = await StudentProduct.find({
      student: studentId,
      boughtfrom: school._id,
    }).populate({
      path: "productBought",
      model: "Product",
    });
    res.json(studentProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

export default router;
