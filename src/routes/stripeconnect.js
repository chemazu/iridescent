import express from "express";
import stripe from "stripe";
import User from "../models/User";
import auth from "../middleware/auth";

const stripeServer = stripe(
  "sk_test_51Hdy76D2aIw6sn6UrGro1AVZ6LEN9PUT3kSF09I9Gzoh6jIViR26iA7iFLdvQDwn9dmgza1gHJ5h6ZLKTCX7lQJZ00gIhQD6Sh"
);
const router = express.Router();

router.get("/account", auth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({
        errors: [{ msg: "user not found" }],
      });
    }

    const account = await stripeServer.accounts.create({
      type: "express",
      country: "NG",
      email: user.email,
      capabilities: {
        transfers: {
          requested: true,
        },
      },
      tos_acceptance: {
        service_agreement: "recipient",
      },
    });

    // update payout frequency for connected account
    await stripeServer.accounts.update(account.id, {
      settings: {
        payouts: {
          schedule: {
            interval: "manual",
          },
        },
      },
    });

    const accountLink = await stripeServer.accountLinks.create({
      account: account.id,
      refresh_url: "http://localhost:3000/reauth",
      return_url: "http://localhost:3000/return",
      type: "account_onboarding",
    });

    res.json(accountLink);
  } catch (error) {
    console.log(error);
    res.status(500).send("server error");
  }
});

router.post("/pay", auth, async (req, res) => {
  try {
    const deletedAccount = await stripeServer.accounts.del(
      "acct_1N5oKuRiQiTyou9e"
    );
    console.log(`Deleted account with ID ${deletedAccount.id}`);
    res.json(deletedAccount);
  } catch (error) {
    console.log(error);
    res.status(500).send("server error");
  }
});

export default router;