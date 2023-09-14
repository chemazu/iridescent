import express from "express";
import Bankdetails from "../models/Bankdetails";
import { body, validationResult } from "express-validator";
import auth from "../middleware/auth";
import validateUserPayment from "../middleware/validateUserPayment";
import axios from "axios";

const router = express.Router();

router.get("/banklist", auth, async (req, res) => {
  const config = {
    headers: {
      // use payment secret key to validate the transaction
      Authorization: `Bearer ${process.env.PAYSTACK_PRIVATE_KEY}`,
    },
  };
  try {
    const paystack_response = await axios.get(
      `https://api.paystack.co/bank`,
      config
    );
    res.json(paystack_response.data.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("internal server error");
  }
});

router.get("/verify/:bankcode/:accountnumber", auth, async (req, res) => {
  try {
    const accountnumber = req.params.accountnumber;
    const bankcode = req.params.bankcode;

    const config = {
      headers: {
        // use payment secret key to validate the transaction
        Authorization: `Bearer ${process.env.PAYSTACK_PRIVATE_KEY}`,
      },
    };
    const paystack_response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${accountnumber}&bank_code=${bankcode}`,
      config
    );
    res.json(paystack_response.data.data);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post(
  "/",
  auth,
  validateUserPayment,
  body("bankcode", "invalid account name").not().isEmpty(),
  body("accountnumber", "invalid account number").not().isEmpty(),
  body("bankname", "invalid bank name").not().isEmpty(),
  body("accountname", "invalid account name").not().isEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
        });
      }
      const { bankcode, accountnumber, bankname, accountname } = req.body;

      // check to ensure bankcode doesn't already exists
      const existingBankDetails = await Bankdetails.findOne({
        bankcode: bankcode,
        accountnumber: accountnumber,
      });

      if (existingBankDetails) {
        return res.status(400).json({
          errors: [{ msg: "bank details already exists" }],
        });
      }

      const newAccountDetails = new Bankdetails({
        user: req.user.id,
        bankname: bankname,
        bankcode: bankcode,
        accountnumber: accountnumber,
        accountname: accountname,
      });
      newAccountDetails.save();
      res.json(newAccountDetails);
    } catch (error) {
      console.error(error);
      res.status(500).json("internal server error");
    }
  }
);

router.get("/me", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const accounts = await Bankdetails.find({
      user: userId,
    });
    res.json(accounts);
  } catch (error) {
    console.error(error);
    res.status(500).json("internal server error");
  }
});

router.delete("/:accountId", auth, validateUserPayment, async (req, res) => {
  const accountId = req.params.accountId;
  try {
    const account = await Bankdetails.deleteOne({
      _id: accountId,
    });
    res.json(account);
  } catch (error) {
    console.error(error);
    res.status(500).json("internal server error");
  }
});

export default router;
