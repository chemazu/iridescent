import express from "express";
import { body, validationResult } from "express-validator";
import ProductType from "../models/ProductType";
import auth from "../middleware/auth";
import validateAdminRoute from "../middleware/validateAdminRoute";

const router = express.Router();

// route to get courses
router.get("/producttitle", async (req, res) => {
  try {
    const suggest = req.query.data;
    const regex = new RegExp(suggest, "i"); // i for case insensitive search
    if (suggest.length === 0) {
      const results = await ProductType.find().sort("title");
      res.json(results);
    } else {
      const results = await ProductType.find({
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

// route to create new courses
router.post(
  "/producttitle",
  auth,
  validateAdminRoute,
  [body("title", "product type title must be provided").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const { title } = req.body;
    try {
      const newProductType = new ProductType({
        title,
      });
      await newProductType.save();
      res.json(newProductType);
    } catch (error) {
      res.status(500).send("Server Error");
      console.error(error);
    }
  }
);

export default router;
