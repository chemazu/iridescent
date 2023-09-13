"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _Bankdetails = _interopRequireDefault(require("../models/Bankdetails"));

var _expressValidator = require("express-validator");

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _validateUserPayment = _interopRequireDefault(require("../middleware/validateUserPayment"));

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.get("/banklist", _auth.default, async (req, res) => {
  const config = {
    headers: {
      // use payment secret key to validate the transaction
      Authorization: `Bearer ${process.env.PAYSTACK_PRIVATE_KEY}`
    }
  };

  try {
    const paystack_response = await _axios.default.get(`https://api.paystack.co/bank`, config);
    res.json(paystack_response.data.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("internal server error");
  }
});
router.get("/verify/:bankcode/:accountnumber", _auth.default, async (req, res) => {
  try {
    const accountnumber = req.params.accountnumber;
    const bankcode = req.params.bankcode;
    const config = {
      headers: {
        // use payment secret key to validate the transaction
        Authorization: `Bearer ${process.env.PAYSTACK_PRIVATE_KEY}`
      }
    };
    const paystack_response = await _axios.default.get(`https://api.paystack.co/bank/resolve?account_number=${accountnumber}&bank_code=${bankcode}`, config);
    res.json(paystack_response.data.data);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.post("/", _auth.default, _validateUserPayment.default, (0, _expressValidator.body)("bankcode", "invalid account name").not().isEmpty(), (0, _expressValidator.body)("accountnumber", "invalid account number").not().isEmpty(), (0, _expressValidator.body)("bankname", "invalid bank name").not().isEmpty(), (0, _expressValidator.body)("accountname", "invalid account name").not().isEmpty(), async (req, res) => {
  try {
    const errors = (0, _expressValidator.validationResult)(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const {
      bankcode,
      accountnumber,
      bankname,
      accountname
    } = req.body; // check to ensure bankcode doesn't already exists

    const existingBankDetails = await _Bankdetails.default.findOne({
      bankcode: bankcode,
      accountnumber: accountnumber
    });

    if (existingBankDetails) {
      return res.status(400).json({
        errors: [{
          msg: "bank details already exists"
        }]
      });
    }

    const newAccountDetails = new _Bankdetails.default({
      user: req.user.id,
      bankname: bankname,
      bankcode: bankcode,
      accountnumber: accountnumber,
      accountname: accountname
    });
    newAccountDetails.save();
    res.json(newAccountDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json("internal server error");
  }
});
router.get("/me", _auth.default, async (req, res) => {
  const userId = req.user.id;

  try {
    const accounts = await _Bankdetails.default.find({
      user: userId
    });
    res.json(accounts);
  } catch (error) {
    console.error(error);
    res.status(500).json("internal server error");
  }
});
router.delete("/:accountId", _auth.default, _validateUserPayment.default, async (req, res) => {
  const accountId = req.params.accountId;

  try {
    const account = await _Bankdetails.default.deleteOne({
      _id: accountId
    });
    res.json(account);
  } catch (error) {
    console.error(error);
    res.status(500).json("internal server error");
  }
});
var _default = router;
exports.default = _default;