import express from "express";
import { body, validationResult } from "express-validator";
import CourseType from "../models/CourseType";
import auth from "../middleware/auth";
import validateAdminRoute from "../middleware/validateAdminRoute";
import RootCategory from "../models/RootCategory";

const router = express.Router();

// route to get courses
router.get("/coursetitle", async (req, res) => {
  try {
    const suggest = req.query.data;
    const regex = new RegExp(suggest, "i"); // i for case insensitive search
    if (suggest.length === 0) {
      const results = await CourseType.find().sort("title");
      res.json(results);
    } else {
      const results = await CourseType.find({
        title: {
          $regex: regex,
        },
      }).sort("title");
      res.json(results);
    }
  } catch (error) {
    res.status(500).send("Server Error");
    console.error(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const results = await CourseType.find({}).sort("title");
    res.json(results);
  } catch (error) {
    res.status(500).send("Server Error");
    console.error(error);
  }
});

// route to create new courses
router.post(
  "/coursetitle/:rootcategory",
  auth,
  validateAdminRoute,
  [body("title", "course type title must be provided").not().isEmpty()],

  async (req, res) => {
    const errors = validationResult(req);
    let rootCategory = req.params.rootcategory;

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const { title } = req.body;
    try {
      let rootCategoryExists = await RootCategory.findOne({
        _id: rootCategory,
      });
      if (rootCategoryExists) {
        const newCourseType = new CourseType({
          title,
          rootcategory: rootCategoryExists._id,
        });
        await newCourseType.save();
        res.json(newCourseType);
      } else {
        res.status(400).send("Root Category doesn't exist");
      }
    } catch (error) {
      res.status(500).send("Server Error");
      console.error(error);
    }
  }
);

router.get("/:rootCategoryId", async (req, res) => {
  const rootCategoryId = req.params.rootCategoryId;
  try {
    const courseTypes = await CourseType.find({
      rootcategory: rootCategoryId,
    }).sort("title");
    res.json(courseTypes);
  } catch (error) {
    res.status(500).send("Server Error");
    console.error(error);
  }
});

export default router;
