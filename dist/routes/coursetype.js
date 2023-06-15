"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _CourseType = _interopRequireDefault(require("../models/CourseType"));

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _validateAdminRoute = _interopRequireDefault(require("../middleware/validateAdminRoute"));

var _RootCategory = _interopRequireDefault(require("../models/RootCategory"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router(); // route to get courses


router.get("/coursetitle", async (req, res) => {
  try {
    const suggest = req.query.data;
    const regex = new RegExp(suggest, "i"); // i for case insensitive search

    if (suggest.length === 0) {
      const results = await _CourseType.default.find().sort("title");
      res.json(results);
    } else {
      const results = await _CourseType.default.find({
        title: {
          $regex: regex
        }
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
    const results = await _CourseType.default.find({}).sort("title");
    res.json(results);
  } catch (error) {
    res.status(500).send("Server Error");
    console.error(error);
  }
}); // route to create new courses

router.post("/coursetitle/:rootcategory", _auth.default, _validateAdminRoute.default, [(0, _expressValidator.body)("title", "course type title must be provided").not().isEmpty()], async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);
  let rootCategory = req.params.rootcategory;

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const {
    title
  } = req.body;

  try {
    let rootCategoryExists = await _RootCategory.default.findOne({
      _id: rootCategory
    });

    if (rootCategoryExists) {
      const newCourseType = new _CourseType.default({
        title,
        rootcategory: rootCategoryExists._id
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
});
router.get("/:rootCategoryId", async (req, res) => {
  const rootCategoryId = req.params.rootCategoryId;

  try {
    const courseTypes = await _CourseType.default.find({
      rootcategory: rootCategoryId
    }).sort("title");
    res.json(courseTypes);
  } catch (error) {
    res.status(500).send("Server Error");
    console.error(error);
  }
});
var _default = router;
exports.default = _default;