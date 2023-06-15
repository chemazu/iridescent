"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _validateAdminRoute = _interopRequireDefault(require("../middleware/validateAdminRoute"));

var _Affiliates = _interopRequireDefault(require("../models/Affiliates"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.post("/", _auth.default, _validateAdminRoute.default, [(0, _expressValidator.body)("code_name", "invalid code name").not().isEmpty(), (0, _expressValidator.body)("username", "invalid username").not().isEmpty(), (0, _expressValidator.body)("firstname", "invalid firstname").not().isEmpty(), (0, _expressValidator.body)("lastname", "invalid lastname").not().isEmpty(), (0, _expressValidator.body)("email", "invalid email").not().isEmpty().isEmail()], async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const {
    code_name,
    username,
    firstname,
    lastname,
    email,
    userId
  } = req.body;

  try {
    const affiliateDetails = {
      code_name,
      username,
      firstname,
      lastname,
      email
    };

    if (userId) {
      affiliateDetails["userId"] = userId;
    }

    const affiliate = new _Affiliates.default(affiliateDetails);
    await affiliate.save();
    res.json(affiliate);
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});
var _default = router;
exports.default = _default;