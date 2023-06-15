import express from "express";
import { body, validationResult } from "express-validator";
import RootCategory from "../models/RootCategory";
import auth from "../middleware/auth";
import validateAdminRoute from "../middleware/validateAdminRoute";

const router = express.Router();

router.get("/categorytitle", async (req, res) => {
  try {
    const suggest = req.query.data;
    const regex = new RegExp(suggest, "i"); // i for case insensitive search
    if (suggest.length === 0) {
      const results = await RootCategory.find().sort("title");
      res.json(results);
    } else {
      const results = await RootCategory.find({
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
    const results = await RootCategory.find({}).sort("title");
    res.json(results);
  } catch (error) {
    res.status(500).send("Server Error");
    console.error(error);
  }
});

// route to create new Category
router.post(
  "/categorytitle",
  auth,
  validateAdminRoute,
  [body("title", "Category title must be provided").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const { title } = req.body;
    try {
      const newRootCategory = new RootCategory({
        title,
      });
      await newRootCategory.save();
      res.json(newRootCategory);
    } catch (error) {
      res.status(500).send("Server Error");
      console.error(error);
    }
  }
);

export default router;
