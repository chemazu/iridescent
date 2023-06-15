import express from "express";
import { body, validationResult } from "express-validator";
import crypto from "crypto";
import mongoose from "mongoose";
import Wallet from "../models/Wallet";
import User from "../models/User";
import Order from "../models/Order";
import Bankdetails from "../models/Bankdetails";
import auth from "../middleware/auth";
import validateUserPayment from "../middleware/validateUserPayment";
import axios from "axios";

const router = express.Router();

router.post(
  "/withdraw",
  body("accountid", "account ID must be provided").not().isEmpty(),
  body("amount", "withdrawal amount must be provided").not().isEmpty(),
  body("actualPayout", "actual payout not provided").not().isEmpty(),
  auth,
  validateUserPayment,
  async (req, res) => {
    const userId = req.user.id;
    const { accountid, amount, actualPayout } = req.body;

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.json({
          errors: errors.array(),
        });
      }

      const validAccount = await Bankdetails.findOne({
        _id: mongoose.Types.ObjectId(accountid),
      });

      if (!validAccount) {
        return res.status(400).json({
          errors: [{ msg: "user bank details not found" }],
        });
      }

      // code to validate user withdrawal amount before Processing
      const userOrderSumAgg = await Order.aggregate([
        // first we get the total sum of orders user has
        {
          $match: {
            boughtfrom: mongoose.Types.ObjectId(userId),
          },
        },
        {
          $group: {
            _id: null,
            salesTotal: {
              $sum: "$amount",
            },
          },
        },
      ]);

      const withdrawalSumAgg = await Wallet.aggregate([
        // second we calculate the total sum of withrawals made
        {
          $match: {
            user: mongoose.Types.ObjectId(userId),
          },
        },
        {
          $group: {
            _id: null,
            withdrawalsumTotal: {
              $sum: "$amount",
            },
          },
        },
      ]);

      const totalOrdersSum =
        userOrderSumAgg.length === 0 ? 0 : userOrderSumAgg[0].salesTotal;
      const totalWithdrawalSum =
        withdrawalSumAgg.length === 0
          ? 0
          : withdrawalSumAgg[0].withdrawalsumTotal;
      const userWithdrawBalance = totalOrdersSum - totalWithdrawalSum;

      if (amount > userWithdrawBalance) {
        return res.status(400).json({
          errors: [{ msg: "withdraw amount exceeds available balance" }],
        });
      }

      // call the paystack API here to Create a
      //  transfer recipient
      const config = {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_PRIVATE_KEY}`,
          "Content-Type": "application/json",
        },
      };

      const requestBody = JSON.stringify({
        type: "nuban",
        name: validAccount.accountname,
        account_number: validAccount.accountnumber,
        bank_code: validAccount.bankcode,
        currency: "NGN",
      });

      const paystack_response = await axios.post(
        `https://api.paystack.co/transferrecipient`,
        requestBody,
        config
      );

      if (paystack_response.data.status === true) {
        const transferRequestBody = JSON.stringify({
          source: "balance",
          amount: actualPayout * 100,
          recipient: paystack_response.data.data.recipient_code,
          reason: "Payment From Tutorly dashboard balance",
        });

        const transfer_response = await axios.post(
          `https://api.paystack.co/transfer`,
          transferRequestBody,
          config
        );
        if (
          transfer_response.data.data.status === "pending" ||
          transfer_response.data.data.status === "success"
        ) {
          const wallet = new Wallet({
            user: userId,
            amount: amount,
            status: "success",
            transferrecipient: accountid,
            actualPayout: actualPayout,
            transferreference: transfer_response.data.data.reference,
            recipientcode: paystack_response.data.data.recipient_code,
          });
          await wallet.save();
          res.json(transfer_response.data);
        } else {
          return res.status(400).json({
            errors: [
              {
                msg: "Error Making Transfer, Please Try Later...",
              },
            ],
          });
        }
      } else {
        return res.status(400).json({
          errors: [
            {
              msg: "error processing transaction",
            },
          ],
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  }
);

router.get("/withraw/count", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const withDrawalCount = await Wallet.countDocuments({
      user: userId,
    });
    res.json(withDrawalCount);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.get("/withraw/sum", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const withdrawalSum = await Wallet.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          withdrawalsumTotal: {
            $sum: "$amount",
          },
        },
      },
    ]);
    res.json(withdrawalSum);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.get("/withdraw", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const withdrawals = await Wallet.find({
      user: userId,
    }).populate("transferrecipient", ["bankname", "accountname"]);
    res.json(withdrawals);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

export default router;
