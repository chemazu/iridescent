"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _stripe = _interopRequireDefault(require("stripe"));

var _User = _interopRequireDefault(require("../models/User"));

var _auth = _interopRequireDefault(require("../middleware/auth"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const stripeServer = (0, _stripe.default)("sk_test_51Hdy76D2aIw6sn6UrGro1AVZ6LEN9PUT3kSF09I9Gzoh6jIViR26iA7iFLdvQDwn9dmgza1gHJ5h6ZLKTCX7lQJZ00gIhQD6Sh");

const router = _express.default.Router();

router.get("/account", _auth.default, async (req, res) => {
  try {
    const user = await _User.default.findOne({
      _id: req.user.id
    });

    if (!user) {
      return res.status(404).json({
        errors: [{
          msg: "user not found"
        }]
      });
    }

    const account = await stripeServer.accounts.create({
      type: "express",
      country: "NG",
      email: user.email,
      capabilities: {
        transfers: {
          requested: true
        }
      },
      tos_acceptance: {
        service_agreement: "recipient"
      }
    }); // update payout frequency for connected account

    await stripeServer.accounts.update(account.id, {
      settings: {
        payouts: {
          schedule: {
            interval: "manual"
          }
        }
      }
    });
    const accountLink = await stripeServer.accountLinks.create({
      account: account.id,
      refresh_url: "http://localhost:3000/reauth",
      return_url: "http://localhost:3000/return",
      type: "account_onboarding"
    });
    res.json(accountLink);
  } catch (error) {
    console.log(error);
    res.status(500).send("server error");
  }
});
router.post("/pay", _auth.default, async (req, res) => {
  try {
    const deletedAccount = await stripeServer.accounts.del("acct_1N5oKuRiQiTyou9e");
    console.log(`Deleted account with ID ${deletedAccount.id}`);
    res.json(deletedAccount);
  } catch (error) {
    console.log(error);
    res.status(500).send("server error");
  }
});
var _default = router;
exports.default = _default;