"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _RootCategory = _interopRequireDefault(require("../models/RootCategory"));

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _validateAdminRoute = _interopRequireDefault(require("../middleware/validateAdminRoute"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.get("/categorytitle", async (req, res) => {
  try {
    const suggest = req.query.data;
    const regex = new RegExp(suggest, "i"); // i for case insensitive search

    if (suggest.length === 0) {
      const results = await _RootCategory.default.find().sort("title");
      res.json(results);
    } else {
      const results = await _RootCategory.default.find({
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
    const results = await _RootCategory.default.find({}).sort("title");
    res.json(results);
  } catch (error) {
    res.status(500).send("Server Error");
    console.error(error);
  }
}); // route to create new Category

router.post("/categorytitle", _auth.default, _validateAdminRoute.default, [(0, _expressValidator.body)("title", "Category title must be provided").not().isEmpty()], async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const {
    title
  } = req.body;

  try {
    const newRootCategory = new _RootCategory.default({
      title
    });
    await newRootCategory.save();
    res.json(newRootCategory);
  } catch (error) {
    res.status(500).send("Server Error");
    console.error(error);
  }
});
var _default = router;
exports.default = _default;