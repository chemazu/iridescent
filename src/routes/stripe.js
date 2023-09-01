import express from "express";
import stripe from "stripe";
import User from "../models/User";
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
    const user = await User.find({ _id: userId });

    // create user as a new stripe customer
    const customer = await stripe.CustomersResource.create({
      name: `${user.firstname} ${user.lastname}`,
      email: user.email,
      payment_method: payment_method,
      invoice_settings: {
        default_payment_method: payment_method,
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: stripe_product_code,
        },
      ],
      payment_settings: {
        payment_method_options: {
          card: {
            request_three_d_secure: "any",
          },
        },
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      expand: "latest_invoice.payment_intent",
    });

    user.stripeCustomerId = customer.id;
    user.stripeSubscriptionId = subscription.id;
    await user.save();

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