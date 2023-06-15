"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _crypto = _interopRequireDefault(require("crypto"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _Wallet = _interopRequireDefault(require("../models/Wallet"));

var _User = _interopRequireDefault(require("../models/User"));

var _Order = _interopRequireDefault(require("../models/Order"));

var _Bankdetails = _interopRequireDefault(require("../models/Bankdetails"));

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _validateUserPayment = _interopRequireDefault(require("../middleware/validateUserPayment"));

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.post("/withdraw", (0, _expressValidator.body)("accountid", "account ID must be provided").not().isEmpty(), (0, _expressValidator.body)("amount", "withdrawal amount must be provided").not().isEmpty(), (0, _expressValidator.body)("actualPayout", "actual payout not provided").not().isEmpty(), _auth.default, _validateUserPayment.default, async (req, res) => {
  const userId = req.user.id;
  const {
    accountid,
    amount,
    actualPayout
  } = req.body;

  try {
    const errors = (0, _expressValidator.validationResult)(req);

    if (!errors.isEmpty()) {
      return res.json({
        errors: errors.array()
      });
    }

    const validAccount = await _Bankdetails.default.findOne({
      _id: _mongoose.default.Types.ObjectId(accountid)
    });

    if (!validAccount) {
      return res.status(400).json({
        errors: [{
          msg: "user bank details not found"
        }]
      });
    } // code to validate user withdrawal amount before Processing


    const userOrderSumAgg = await _Order.default.aggregate([// first we get the total sum of orders user has
    {
      $match: {
        boughtfrom: _mongoose.default.Types.ObjectId(userId)
      }
    }, {
      $group: {
        _id: null,
        salesTotal: {
          $sum: "$amount"
        }
      }
    }]);
    const withdrawalSumAgg = await _Wallet.default.aggregate([// second we calculate the total sum of withrawals made
    {
      $match: {
        user: _mongoose.default.Types.ObjectId(userId)
      }
    }, {
      $group: {
        _id: null,
        withdrawalsumTotal: {
          $sum: "$amount"
        }
      }
    }]);
    const totalOrdersSum = userOrderSumAgg.length === 0 ? 0 : userOrderSumAgg[0].salesTotal;
    const totalWithdrawalSum = withdrawalSumAgg.length === 0 ? 0 : withdrawalSumAgg[0].withdrawalsumTotal;
    const userWithdrawBalance = totalOrdersSum - totalWithdrawalSum;

    if (amount > userWithdrawBalance) {
      return res.status(400).json({
        errors: [{
          msg: "withdraw amount exceeds available balance"
        }]
      });
    } // call the paystack API here to Create a
    //  transfer recipient


    const config = {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_PRIVATE_KEY}`,
        "Content-Type": "application/json"
      }
    };
    const requestBody = JSON.stringify({
      type: "nuban",
      name: validAccount.accountname,
      account_number: validAccount.accountnumber,
      bank_code: validAccount.bankcode,
      currency: "NGN"
    });
    const paystack_response = await _axios.default.post(`https://api.paystack.co/transferrecipient`, requestBody, config);

    if (paystack_response.data.status === true) {
      const transferRequestBody = JSON.stringify({
        source: "balance",
        amount: actualPayout * 100,
        recipient: paystack_response.data.data.recipient_code,
        reason: "Payment From Tutorly dashboard balance"
      });
      const transfer_response = await _axios.default.post(`https://api.paystack.co/transfer`, transferRequestBody, config);

      if (transfer_response.data.data.status === "pending" || transfer_response.data.data.status === "success") {
        const wallet = new _Wallet.default({
          user: userId,
          amount: amount,
          status: "success",
          transferrecipient: accountid,
          actualPayout: actualPayout,
          transferreference: transfer_response.data.data.reference,
          recipientcode: paystack_response.data.data.recipient_code
        });
        await wallet.save();
        res.json(transfer_response.data);
      } else {
        return res.status(400).json({
          errors: [{
            msg: "Error Making Transfer, Please Try Later..."
          }]
        });
      }
    } else {
      return res.status(400).json({
        errors: [{
          msg: "error processing transaction"
        }]
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});
router.get("/withraw/count", _auth.default, async (req, res) => {
  const userId = req.user.id;

  try {
    const withDrawalCount = await _Wallet.default.countDocuments({
      user: userId
    });
    res.json(withDrawalCount);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});
router.get("/withraw/sum", _auth.default, async (req, res) => {
  const userId = req.user.id;

  try {
    const withdrawalSum = await _Wallet.default.aggregate([{
      $match: {
        user: _mongoose.default.Types.ObjectId(userId)
      }
    }, {
      $group: {
        _id: null,
        withdrawalsumTotal: {
          $sum: "$amount"
        }
      }
    }]);
    res.json(withdrawalSum);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});
router.get("/withdraw", _auth.default, async (req, res) => {
  const userId = req.user.id;

  try {
    const withdrawals = await _Wallet.default.find({
      user: userId
    }).populate("transferrecipient", ["bankname", "accountname"]);
    res.json(withdrawals);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});
var _default = router;
exports.default = _default;