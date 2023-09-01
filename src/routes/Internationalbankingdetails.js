import express from "express";
import { body, validationResult } from "express-validator";
import InternationalBankDetails from "../models/InternationalBankDetails";
import ExchangeRate from "../models/ExchangeRate.js";
import Wallet from "../models/Wallet";
import auth from "../middleware/auth";
import axios from "axios";
import roundToTwoDecimalPlaces from "../utilities/roundToTwoDecimalPlaces";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const accounts = await InternationalBankDetails.find({
      user: req.user.id,
    });
    res.json(accounts);
  } catch (error) {
    console.error(error.response.data);
    res.status(500).json(error.response.data);
  }
});

router.post(
  "/usd/outside",
  auth,
  body("accountHolderName", "invalid Account Holder Name").not().isEmpty(),
  body("accountNumber", "invalid account number").not().isEmpty(),
  body("legalType", "invalid legal type").not().isEmpty(),
  body("swiftCode", "invalid swift code").not().isEmpty(),
  body("country", "country value can not be empty").not().isEmpty(),
  body("city", "city value can not be empty").not().isEmpty(),
  body("postCode", "postcode can not be empty").not().isEmpty(),
  body("firstLine", "address can not be empty").not().isEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
        });
      }

      const accountProfileId = process.env.WISE_PROFILE_ID;
      const {
        accountHolderName,
        accountNumber,
        legalType,
        swiftCode,
        country,
        state,
        city,
        postCode,
        firstLine,
      } = req.body;

      // check if account data already exists
      const bankDetailsExists = await InternationalBankDetails.findOne({
        user: req.user.id,
        accountspecificationtype: "swift_code",
        accountnumber: accountNumber,
      });

      if (bankDetailsExists) {
        return res.status(400).json({
          errors: [{ msg: "account details exists " }],
        });
      }

      const addressData =
        state.length > 0
          ? {
              country: country, // as country code
              city: city,
              postCode: postCode,
              firstLine: firstLine,
              state: state,
            }
          : {
              country: country, // as country code
              city: city,
              postCode: postCode,
              firstLine: firstLine,
            };

      // this data is for outside the US
      //  this transfer would cost 3.90. actual payout would be
      //  amount to be paid - 3.90
      const data = {
        profile: accountProfileId,
        accountHolderName: accountHolderName,
        currency: "USD",
        type: "swift_code",
        details: {
          legalType: legalType, // "PRIVATE" that is personal, or "BUSINESS that is business"
          swiftCode: swiftCode, // swiftCode
          accountNumber: accountNumber, // / IBAN or accountNumber
          address: addressData,
        },
      };

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.WISE_ACCOUNT_TOKEN}`,
        },
      };
      const body = JSON.stringify(data);
      const response = await axios.post(
        "https://api.transferwise.com/v1/accounts",
        body,
        config
      );

      const bankDetails = {
        user: req.user.id,
        accountspecificationtype: "swift_code",
        accountholdername: accountHolderName,
        accountnumber: accountNumber,
        legaltype: legalType,
        swiftcode: swiftCode,
        country: country,
        state: state.length > 0 ? state : "",
        city: city,
        postcode: postCode,
        firstline: firstLine,
        accountCurrencyType: "USD", // as either US, EURO or GBP
        wise_account_id: response.data.id,
      };
      const newIntlBankDetails = new InternationalBankDetails(bankDetails);
      newIntlBankDetails.save();

      res.json(newIntlBankDetails);
    } catch (error) {
      console.error(error.response.data);
      res.status(500).json(error.response.data);
    }
  }
);

router.post(
  "/usd/within",
  auth,
  body("accountHolderName", "invalid Account Holder Name").not().isEmpty(),
  body("accountNumber", "invalid account number").not().isEmpty(),
  body("legalType", "invalid legal type").not().isEmpty(),
  body("routingNumber", "invalid routing number code").not().isEmpty(),
  body("accountType", "account type is required").not().isEmpty(),
  body("country", "country value can not be empty").not().isEmpty(),
  body("city", "city value can not be empty").not().isEmpty(),
  body("postCode", "postcode can not be empty").not().isEmpty(),
  body("firstLine", "address can not be empty").not().isEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
        });
      }

      const accountProfileId = process.env.WISE_PROFILE_ID;
      const {
        legalType,
        accountHolderName,
        accountNumber,
        routingNumber,
        accountType,
        country,
        state,
        city,
        postCode,
        firstLine,
      } = req.body;

      // check if account data already exists
      const bankDetailsExists = await InternationalBankDetails.findOne({
        user: req.user.id,
        accountspecificationtype: "aba",
        accountnumber: accountNumber,
      });

      if (bankDetailsExists) {
        return res.status(400).json({
          errors: [{ msg: "account details exists" }],
        });
      }

      const addressData =
        state.length > 0
          ? {
              country: country, // as country code
              city: city,
              postCode: postCode,
              firstLine: firstLine,
              state: state,
            }
          : {
              country: country, // as country code
              city: city,
              postCode: postCode,
              firstLine: firstLine,
            };

      const data = {
        profile: accountProfileId,
        accountHolderName: accountHolderName,
        currency: "USD",
        type: "aba",
        details: {
          legalType: legalType, // "PRIVATE" that is personal, or "BUSINESS that is business"
          abartn: routingNumber, // ROUTING NUMBER
          accountNumber: accountNumber, // IBAN or accountNumber
          accountType: accountType, // CHECKING as in checking or SAVINGS as in savings,
          address: addressData,
        },
      };

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.WISE_ACCOUNT_TOKEN}`,
        },
      };
      const body = JSON.stringify(data);
      const response = await axios.post(
        "https://api.transferwise.com/v1/accounts",
        body,
        config
      );

      const bankDetails = {
        user: req.user.id,
        accountspecificationtype: "aba",
        accountholdername: accountHolderName,
        accountnumber: accountNumber,
        legaltype: legalType,
        routingcode: routingNumber,
        accounttype: accountType,
        country: country,
        state: state.length > 0 ? state : "",
        city: city,
        postcode: postCode,
        firstline: firstLine,
        accountCurrencyType: "USD",
        wise_account_id: response.data.id,
      };
      const newIntlBankDetails = new InternationalBankDetails(bankDetails);
      newIntlBankDetails.save();

      res.json(newIntlBankDetails);
    } catch (error) {
      console.error(error.response.data);
      console.log(error.response.data.errors[0].arguments);
      res.status(500).json(error.response.data);
    }
  }
);

// router.post(
//   "/gbp",
//   auth,
//   body("bankcode", "invalid account name").not().isEmpty(),
//   body("accountnumber", "invalid account number").not().isEmpty(),
//   body("bankname", "invalid bank name").not().isEmpty(),
//   body("accountname", "invalid account name").not().isEmpty(),
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           errors: errors.array(),
//         });
//       }

//       res.json(newAccountDetails);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json("internal server error");
//     }
//   }
// );

router.get("/transfer/quote/:accountId", auth, async (req, res) => {
  const amount = req.query.amount;
  try {
    // get account details before quote is generated
    const userBankDetails = await InternationalBankDetails.findOne({
      _id: req.params.accountId,
    });
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WISE_ACCOUNT_TOKEN}`,
      },
    };

    const data = {
      sourceCurrency: "USD",
      targetCurrency: userBankDetails.accountCurrencyType,
      sourceAmount: amount,
      rateType: "Fixed",
      payOut: "BANK_TRANSFER",
      preferredPayIn: "BALANCE",
    };
    const body = JSON.stringify(data);
    const response = await axios.post(
      `https://api.transferwise.com/v3/profiles/${process.env.WISE_PROFILE_ID}/quotes`,
      body,
      config
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

router.post("/transfer/:quoteId/:accountId", auth, async (req, res) => {
  const quote = req.params.quoteId;
  const accountId = req.params.accountId;
  const { amount, payout } = req.body;
  try {
    const userBankDetails = await InternationalBankDetails.findOne({
      _id: accountId,
    });

    // get exchange rate
    const exchangeRate = await ExchangeRate.findOne({
      currencyName: "usd",
    });

    const transactionId = uuidv4();
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WISE_ACCOUNT_TOKEN}`,
      },
    };

    // remember to add validation here
    const data = {
      targetAccount: userBankDetails.wise_account_id,
      quoteUuid: quote,
      customerTransactionId: transactionId,
      details: {
        reference: "Ttrl Funds",
      },
    };
    const body = JSON.stringify(data);
    const response = await axios.post(
      "https://api.transferwise.com/v1/transfers",
      body,
      config
    );

    const transferId = response.data.id;
    // save international withdrawal data
    // for display to user
    const newWithdrawal = new Wallet({
      user: req.user.id,
      bankaccount: userBankDetails._id,
      status: response.data.status,
      transactionid: transactionId,
      quoteid: quote,
      amount_usd: amount,
      amount: roundToTwoDecimalPlaces(
        exchangeRate.exchangeRateAmountToNaira * amount
      ),
      actualPayout_usd: payout,
      actualPayout: roundToTwoDecimalPlaces(
        exchangeRate.exchangeRateAmountToNaira * payout
      ),
      wise_transfer_id: transferId,
      withdrawal_currency_type: "usd",
      transaction_type: "foreign",
    });

    await newWithdrawal.save();

    const fundTransferConfig = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WISE_ACCOUNT_TOKEN}`,
      },
    };
    const fundTransferBody = JSON.stringify({
      type: "BALANCE",
    });
    const fundTransferUrl = `https://api.transferwise.com/v3/profiles/${process.env.WISE_PROFILE_ID}/transfers/${transferId}/payments`;

    // code to fund the newly created transfer operation..
    await axios
      .post(fundTransferUrl, fundTransferBody, fundTransferConfig)
      .then(async (response) => {
        newWithdrawal.status = response.data.status;
        await newWithdrawal.save();
        res.json({ msg: "withdrawal completed successfully." });
      })
      .catch(async (error) => {
        console.log(error, "error on line 386 logged here");
        console.log(transferId, "trnaferId");
        console.log(newWithdrawal.toObject());
        const cancelTransferConfig = {
          headers: {
            Authorization: `Bearer ${process.env.WISE_ACCOUNT_TOKEN}`,
          },
        };
        // cancel the transfer that could not be funded on wise
        await axios.put(
          `https://api.transferwise.com/v1/transfers/${transferId}/cancel`,
          cancelTransferConfig
        );
        // remove the record of that transfer from our database
        await newWithdrawal.remove();
        res.status(500).json({
          msg: "Your withdrawal cannot be completed at this time, Please Try Later.",
        });
      });
  } catch (error) {
    res.status(500).json(error?.response?.data);
  }
});

router.delete("/:accountId", auth, async (req, res) => {
  try {
    const accountId = req.params.accountId;
    const userBankDetails = await InternationalBankDetails.findOne({
      _id: accountId,
    });

    const config = {
      headers: {
        Authorization: `Bearer ${process.env.WISE_ACCOUNT_TOKEN}`,
      },
    };

    await axios.delete(
      `https://api.transferwise.com/v2/accounts/${userBankDetails.wise_account_id}`,
      config
    );
    await userBankDetails.remove();
    res.json({ msg: "Account removed successfully" });
  } catch (error) {
    console.log(error);
    console.error(error?.response?.data);
    res.status(500).json(error?.response?.data);
  }
});

export default router;