import express from "express";
import PrelaunchEmail from "../models/PrelaunchEmail";
import { body, validationResult } from "express-validator";

const router = express.Router();

router.post(
  "/",
  body("email", "valid email is required").not().isEmpty(),
  body("email", "valid email is required").isEmail(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    try {
      const validEmail = await PrelaunchEmail.findOne({
        email: email,
      });

      if (validEmail) {
        return res.status(400).json({
          errors: [{ msg: "email already saved!🤦‍♂️😘😜" }],
        });
      }
      const newPrelaunchUser = new PrelaunchEmail({
        email: email,
      });

      await newPrelaunchUser.save();
      res.json();
    } catch (error) {
      res.status(500).json({
        errors: error,
      });
      console.error(error);
    }
  }
);

export default router;
