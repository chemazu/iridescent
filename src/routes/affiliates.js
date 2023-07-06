import express from "express";
import { body, validationResult } from "express-validator";
import auth from "../middleware/auth";
import validateAdminRoute from "../middleware/validateAdminRoute";
import Affiliate from "../models/Affiliates";

const router = express.Router();

router.post(
  "/",
  auth,
  validateAdminRoute,
  [
    body("code_name", "invalid code name").not().isEmpty(),
    body("username", "invalid username").not().isEmpty(),
    body("firstname", "invalid firstname").not().isEmpty(),
    body("lastname", "invalid lastname").not().isEmpty(),
    body("email", "invalid email").not().isEmpty().isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const { code_name, username, firstname, lastname, email, userId } =
      req.body;
    try {
      const affiliateDetails = {
        code_name,
        username,
        firstname,
        lastname,
        email,
      };
      if (userId) {
        affiliateDetails["userId"] = userId;
      }

      const affiliate = new Affiliate(affiliateDetails);
      await affiliate.save();
      res.json(affiliate);
    } catch (error) {
      res.status(500).send(error);
      console.log(error);
    }
  }
);

export default router;
