import express from "express";
import PageVisit from "../models/PageVisit";
import School from "../models/School";
import { body, validationResult } from "express-validator";
import auth from "../middleware/auth";
import generatePastSixMonths from "../utilities/generatePastSixMonths";

const router = express.Router();

// route to save the page visit...
router.post(
  "/",
  body("schoolname", "school name cannot be empty"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const { ipaddress, schoolname } = req.body;

    try {
      const school = await School.findOne({
        name: schoolname,
      });
      if (!school) {
        return res.status(404).json({
          errors: [
            {
              msg: "school not found",
            },
          ],
        });
      }

      const pageVisit = new PageVisit({
        ipaddress: ipaddress,
        schoolname: schoolname,
        schooldid: school._id,
      });
      await pageVisit.save();
      res.json(pageVisit);
    } catch (error) {
      console.error(error);
      res.status(500).send("server error");
    }
  }
);

// route to get total page visit's
router.get("/total/:schoolId", auth, async (req, res) => {
  const schoolId = req.params.schoolId;
  try {
    const pageVisits = await PageVisit.countDocuments({
      schooldid: schoolId,
    });
    res.json(pageVisits);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

const getPageReportPerMonth = async (period, schoolId) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const year = period.getFullYear();
  const month = period.getMonth();

  // // get the number of days for that month
  // const dayTotal = new Date(year, month, 0).getDate();

  const start = new Date(year, month, 1);
  const end = new Date(year, start.getMonth() + 1, 1);

  const pageVisits = await PageVisit.countDocuments({
    schooldid: schoolId,
    dateofvisit: {
      $gte: start,
      $lt: end,
    },
  });

  return {
    label: `${months[month]} ${year}`,
    data: pageVisits,
  };
};

// route to get page visit's for the past six months...
router.get("/:schoolId", auth, async (req, res) => {
  const schoolId = req.params.schoolId;
  try {
    const [
      sixthMonth,
      fifthMonth,
      fourthMonth,
      thirdMonth,
      secondMonth,
      firstMonth,
    ] = generatePastSixMonths().reverse();
    const labels = [];
    const datas = [];

    Promise.all([
      getPageReportPerMonth(sixthMonth, schoolId),
      getPageReportPerMonth(fifthMonth, schoolId),
      getPageReportPerMonth(fourthMonth, schoolId),
      getPageReportPerMonth(thirdMonth, schoolId),
      getPageReportPerMonth(secondMonth, schoolId),
      getPageReportPerMonth(firstMonth, schoolId),
    ]).then((values) => {
      values.forEach((value) => {
        labels.push(value.label);
        datas.push(value.data);
      });
      res.json({
        labels,
        datas,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

export default router;
