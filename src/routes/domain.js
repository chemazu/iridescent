import express from "express";
import { body, validationResult } from "express-validator";
import Domain from "../models/Domains";
import School from "../models/School";
import auth from "../middleware/auth";
import validateEnterPriseUser from "../middleware/validateEnterpriseUser";

const router = express.Router();

// endpoint that allows user to add a new domain
router.post(
  "/",
  auth,
  validateEnterPriseUser,
  body("domain_name", "domain name is required").not().isEmpty(),
  body("user", "user is required").not().isEmpty(),
  body("school", "school is required").not().isEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
        });
      }

      const { user, school, domain_name } = req.body;

      const existingDomainName = await Domain.findOne({
        domain_name,
      });

      if (existingDomainName) {
        return res.status(400).json({
          errors: [{ msg: "domain name in use." }],
        });
      }

      const newDomain = new Domain({
        user,
        school,
        domain_name,
      });

      await newDomain.save();

      res.json(newDomain);
    } catch (error) {
      res.status(500).send("server error");
      console.error(error);
    }
  }
);

// route to get school associated with a domain name.
router.get("/", async (req, res) => {
  const { domain_name } = req.query;
  try {
    // first find the domain
    const domain = await Domain.findOne({
      domain_name: domain_name,
    });

    if (!domain) {
      return res.status(400).json({
        errors: [{ msg: "domain not found" }],
      });
    }
    // then find the school with the domain
    const school = await School.findOne({ _id: domain.school });
    res.json(school);
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
});

export default router;
