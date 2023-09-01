"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _stripe = _interopRequireDefault(require("stripe"));

var _User = _interopRequireDefault(require("../models/User"));

var _studentAuth = _interopRequireDefault(require("../middleware/studentAuth"));

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _roundToTwoDecimalPlaces = _interopRequireDefault(require("../utilities/roundToTwoDecimalPlaces"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

const stripeServer = (0, _stripe.default)(process.env.STRIPE_SECRET_KEY); // https://stripe.com/docs/currencies
// according to the article above, zero decimal currencies do not require a
// multiplication by 100
// hence we retain a list to save list of currencies and handle edge case
// accordingly

const listOfZeroDecimalCurrencies = ["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"];

const handleListOfZeroIndexEdgeCase = currency => {
  const isStringInArray = listOfZeroDecimalCurrencies.map(item => item.toLowerCase()).includes(currency.toLowerCase());
  return isStringInArray;
};

router.post("/create-payment-intent", _studentAuth.default, async (req, res) => {
  const {
    currency,
    amount,
    metadata
  } = req.body;

  try {
    const paymentIntent = await stripeServer.paymentIntents.create({
      amount: handleListOfZeroIndexEdgeCase(currency) === true ? Math.round(amount) : Math.round(amount * 100),
      currency: currency,
      payment_method_types: ["card"],
      metadata: metadata
    });
    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: {
        message: error.message
      }
    });
  }
});
router.post("/create-subscription", _auth.default, async (req, res) => {
  const {
    stripe_product_code,
    payment_method
  } = req.body;
  const userId = req.user.id;

  try {
    const user = await _User.default.find({
      _id: userId
    }); // create user as a new stripe customer

    const customer = await _stripe.default.CustomersResource.create({
      name: `${user.firstname} ${user.lastname}`,
      email: user.email,
      payment_method: payment_method,
      invoice_settings: {
        default_payment_method: payment_method
      }
    });
    const subscription = await _stripe.default.subscriptions.create({
      customer: customer.id,
      items: [{
        price: stripe_product_code
      }],
      payment_settings: {
        payment_method_options: {
          card: {
            request_three_d_secure: "any"
          }
        },
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription"
      },
      expand: "latest_invoice.payment_intent"
    });
    user.stripeCustomerId = customer.id;
    user.stripeSubscriptionId = subscription.id;
    await user.save();
    res.json({
      clientsecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionId: subscription.id
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: {
        message: error.message
      }
    });
  }
});
var _default = router;
exports.default = _default;