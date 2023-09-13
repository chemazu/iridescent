"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _PageVisit = _interopRequireDefault(require("../models/PageVisit"));

var _School = _interopRequireDefault(require("../models/School"));

var _expressValidator = require("express-validator");

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _generatePastSixMonths = _interopRequireDefault(require("../utilities/generatePastSixMonths"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router(); // route to save the page visit...


router.post("/", (0, _expressValidator.body)("schoolname", "school name cannot be empty"), async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const {
    ipaddress,
    schoolname
  } = req.body;

  try {
    const school = await _School.default.findOne({
      name: schoolname
    });

    if (!school) {
      return res.status(404).json({
        errors: [{
          msg: "school not found"
        }]
      });
    }

    const pageVisit = new _PageVisit.default({
      ipaddress: ipaddress,
      schoolname: schoolname,
      schooldid: school._id
    });
    await pageVisit.save();
    res.json(pageVisit);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
}); // route to get total page visit's

router.get("/total/:schoolId", _auth.default, async (req, res) => {
  const schoolId = req.params.schoolId;

  try {
    const pageVisits = await _PageVisit.default.countDocuments({
      schooldid: schoolId
    });
    res.json(pageVisits);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

const getPageReportPerMonth = async (period, schoolId) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const year = period.getFullYear();
  const month = period.getMonth(); // // get the number of days for that month
  // const dayTotal = new Date(year, month, 0).getDate();

  const start = new Date(year, month, 1);
  const end = new Date(year, start.getMonth() + 1, 1);
  const pageVisits = await _PageVisit.default.countDocuments({
    schooldid: schoolId,
    dateofvisit: {
      $gte: start,
      $lt: end
    }
  });
  return {
    label: `${months[month]} ${year}`,
    data: pageVisits
  };
}; // route to get page visit's for the past six months...


router.get("/:schoolId", _auth.default, async (req, res) => {
  const schoolId = req.params.schoolId;

  try {
    const [sixthMonth, fifthMonth, fourthMonth, thirdMonth, secondMonth, firstMonth] = (0, _generatePastSixMonths.default)().reverse();
    const labels = [];
    const datas = [];
    Promise.all([getPageReportPerMonth(sixthMonth, schoolId), getPageReportPerMonth(fifthMonth, schoolId), getPageReportPerMonth(fourthMonth, schoolId), getPageReportPerMonth(thirdMonth, schoolId), getPageReportPerMonth(secondMonth, schoolId), getPageReportPerMonth(firstMonth, schoolId)]).then(values => {
      values.forEach(value => {
        labels.push(value.label);
        datas.push(value.data);
      });
      res.json({
        labels,
        datas
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});
var _default = router;
exports.default = _default;