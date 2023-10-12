import express from "express";
import stripe from "stripe";
import User from "../models/User";
import PaymentPlans from "../models/PaymentPlans";
import Subscription from "../models/Subscription";
import studentAuth from "../middleware/studentAuth";
import auth from "../middleware/auth";
import roundToTwoDecimalPlaces from "../utilities/roundToTwoDecimalPlaces";

const router = express.Router();
const stripeServer = stripe(process.env.STRIPE_SECRET_KEY);

// https://stripe.com/docs/currencies
// according to the article above, zero decimal currencies do not require a
// multiplication by 100
// hence we retain a list to save list of currencies and handle edge case
// accordingly
const listOfZeroDecimalCurrencies = [
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
];

const handleListOfZeroIndexEdgeCase = (currency) => {
  const isStringInArray = listOfZeroDecimalCurrencies
    .map((item) => item.toLowerCase())
    .includes(currency.toLowerCase());
  return isStringInArray;
};

router.post("/create-payment-intent", studentAuth, async (req, res) => {
  const { currency, amount, metadata } = req.body;
  try {
    const paymentIntent = await stripeServer.paymentIntents.create({
      amount:
        handleListOfZeroIndexEdgeCase(currency) === true
          ? Math.round(amount)
          : Math.round(amount * 100),
      currency: currency,
      payment_method_types: ["card"],
      metadata: metadata,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: {
        message: error.message,
      },
    });
  }
});

router.post("/create-subscription", auth, async (req, res) => {
  const { stripe_product_code, payment_method } = req.body;
  const userId = req.user.id;
  try {
    const user = await User.findOne({ _id: userId });
    const paymentPlan = await PaymentPlans.findOne({
      stripe_plan_code: stripe_product_code,
    });
    console.log(stripe_product_code);
    // create user as a new stripe customer
    const customer = await stripeServer.customers.create({
      name: `${user.firstname} ${user.lastname}`,
      email: user.email,
      payment_method: payment_method,
      invoice_settings: {
        default_payment_method: payment_method,
      },
    });

    const subscription = await stripeServer.subscriptions.create({
      customer: customer.id,
      items: [
        {
          plan: stripe_product_code,
        },
      ],
      expand: ["latest_invoice.payment_intent"],
      payment_settings: {
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
    });

    user.stripeCustomerId = customer.id;
    user.stripeSubscriptionId = subscription.id;
    user.selectedplan = paymentPlan._id;

    // make a new subscription for the newly created subssciption
    const newSubscription = new Subscription({
      user: user._id,
      subscription_plan: paymentPlan._id,
      amount: paymentPlan.planprice,
    });

    await user.save();
    await newSubscription.save();

    res.json({
      clientsecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: {
        message: error.message,
      },
    });
  }
});

export default router;
