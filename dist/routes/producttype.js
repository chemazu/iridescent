"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _ProductType = _interopRequireDefault(require("../models/ProductType"));

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _validateAdminRoute = _interopRequireDefault(require("../middleware/validateAdminRoute"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router(); // route to get courses


router.get("/producttitle", async (req, res) => {
  try {
    const suggest = req.query.data;
    const regex = new RegExp(suggest, "i"); // i for case insensitive search

    if (suggest.length === 0) {
      const results = await _ProductType.default.find().sort("title");
      res.json(results);
    } else {
      const results = await _ProductType.default.find({
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
}); // route to create new courses

router.post("/producttitle", _auth.default, _validateAdminRoute.default, [(0, _expressValidator.body)("title", "product type title must be provided").not().isEmpty()], async (req, res) => {
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
    const newProductType = new _ProductType.default({
      title
    });
    await newProductType.save();
    res.json(newProductType);
  } catch (error) {
    res.status(500).send("Server Error");
    console.error(error);
  }
});
var _default = router;
exports.default = _default;