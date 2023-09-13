"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _PrelaunchEmail = _interopRequireDefault(require("../models/PrelaunchEmail"));

var _expressValidator = require("express-validator");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.post("/", (0, _expressValidator.body)("email", "valid email is required").not().isEmpty(), (0, _expressValidator.body)("email", "valid email is required").isEmail(), async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const {
    email
  } = req.body;

  try {
    const validEmail = await _PrelaunchEmail.default.findOne({
      email: email
    });

    if (validEmail) {
      return res.status(400).json({
        errors: [{
          msg: "email already saved!🤦‍♂️😘😜"
        }]
      });
    }

    const newPrelaunchUser = new _PrelaunchEmail.default({
      email: email
    });
    await newPrelaunchUser.save();
    res.json();
  } catch (error) {
    res.status(500).json({
      errors: error
    });
    console.error(error);
  }
});
var _default = router;
exports.default = _default;