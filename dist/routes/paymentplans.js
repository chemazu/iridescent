"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _axios = _interopRequireDefault(require("axios"));

var _Subscription = _interopRequireDefault(require("../models/Subscription"));

var _PaymentPlans = _interopRequireDefault(require("../models/PaymentPlans"));

var _User = _interopRequireDefault(require("../models/User"));

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _validateUserCanChoosePlan = _interopRequireDefault(require("../middleware/validateUserCanChoosePlan"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.post("/", _auth.default, async (req, res) => {
  try {
    const {
      planname,
      coursecount,
      percentchargepercoursesale,
      planprice,
      totaluploadsize,
      studentsize,
      videouploadsize,
      instantpayout,
      productsupport,
      coursedesigntemplate
    } = req.body;
    const newpaymentPlan = new _PaymentPlans.default({
      planname,
      coursecount,
      percentchargepercoursesale,
      planprice,
      totaluploadsize,
      studentsize,
      videouploadsize,
      instantpayout,
      productsupport,
      coursedesigntemplate
    });
    await newpaymentPlan.save();
    res.json(newpaymentPlan);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
router.get("/", async (req, res) => {
  try {
    const paymentplans = await _PaymentPlans.default.find();
    res.json(paymentplans);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
router.post("/chose", [(0, _expressValidator.body)("planid", "plan ID not found").not().isEmpty()], _auth.default, _validateUserCanChoosePlan.default, async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  try {
    const {
      planid
    } = req.body;
    const validPlan = await _PaymentPlans.default.findOne({
      _id: planid
    });

    if (!validPlan) {
      return res.status(400).json({
        message: "plan not found"
      });
    }

    const user = await _User.default.findOne({
      _id: req.user.id
    });

    if (!user) {
      return res.status(400).json({
        message: "user not found"
      });
    } // if (validPlan._id.toString() === user.selectedplan.toString()) {
    //   // validation to ensure
    //   // the user cannot choose the plan they're already on...
    //   return res.status(400).json({
    //     message: "invalid plan",
    //   });
    // }


    const config = {
      // using test keys
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_PRIVATE_KEY}`,
        "Content-Type": "application/json"
      }
    };
    const body = JSON.stringify({
      email: user.email,
      amount: validPlan.planprice,
      plan: validPlan.paystackplancode
    });
    const paystack_response = await _axios.default.post("https://api.paystack.co/transaction/initialize", body, config);
    res.json(paystack_response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});
router.get("/verify/:reference", _auth.default, async (req, res) => {
  const reference = req.params.reference;

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_PRIVATE_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    };
    const paystack_response = await _axios.default.get(`https://api.paystack.co/transaction/verify/${reference}`, config);

    if (paystack_response.data.data.status === "success") {
      const user = await _User.default.findOne({
        email: paystack_response.data.data.customer.email
      });
      const paymentPlan = await _PaymentPlans.default.findOne({
        paystackplancode: paystack_response.data.data.plan
      });
      user.selectedplan = paymentPlan._id;
      user.subscriptiondata.auth_code = paystack_response.data.data.authorization.authorization_code;
      user.subscriptiondata.cardending = paystack_response.data.data.authorization.last4;
      user.subscriptiondata.cardtype = paystack_response.data.data.authorization.brand;
      user.subscriptiondata.cardexpiry = `${paystack_response.data.data.authorization.exp_month}/${paystack_response.data.data.authorization.exp_year.substr(2)}`; // make a new subscription for the newly created subssciption

      const newSubscription = new _Subscription.default({
        user: user._id,
        subscription_plan: paymentPlan._id,
        amount: paymentPlan.planprice
      });
      await newSubscription.save();
      await user.save();
      res.json(paystack_response.data);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});
router.get("/card/update", _auth.default, async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await _User.default.findOne({
      _id: userId
    });
    const config = {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_PRIVATE_KEY}`
      }
    };
    const paystack_response = await _axios.default.get(`https://api.paystack.co/subscription/${user.subscriptiondata.subscriptioncode}/manage/link`, config);
    res.json(paystack_response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});
var _default = router;
exports.default = _default;