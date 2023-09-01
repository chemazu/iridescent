"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _ExchangeRate = _interopRequireDefault(require("../models/ExchangeRate.js"));

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _validateAdminRoute = _interopRequireDefault(require("../middleware/validateAdminRoute"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.post("/", _auth.default, _validateAdminRoute.default, [(0, _expressValidator.body)("currencyname", "currency name not valid").not().isEmpty(), (0, _expressValidator.body)("exchangeRateAmount", "exchange rate not valid").not().isEmpty()], async (req, res) => {
  try {
    const errors = (0, _expressValidator.validationResult)(req.body);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const {
      currencyname,
      exchangeRateAmount
    } = req.body;
    const exchangeRate = new _ExchangeRate.default({
      currencyName: currencyname,
      exchangeRateAmountToNaira: exchangeRateAmount
    });
    await exchangeRate.save();
    res.json(exchangeRate);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
router.get("/:currencyName", async (req, res) => {
  const currencyName = req.params.currencyName;

  try {
    const exchangeRate = await _ExchangeRate.default.findOne({
      currencyName: currencyName
    });
    res.json(exchangeRate);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
var _default = router;
exports.default = _default;