import express from "express";
import { body, validationResult } from "express-validator";
import ExchangeRate from "../models/ExchangeRate.js";
import auth from "../middleware/auth";
import validateAdminRoute from "../middleware/validateAdminRoute";

const router = express.Router();

router.post(
  "/",
  auth,
  validateAdminRoute,
  [
    body("currencyname", "currency name not valid").not().isEmpty(),
    body("exchangeRateAmount", "exchange rate not valid").not().isEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req.body);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
        });
      }
      const { currencyname, exchangeRateAmount } = req.body;
      const exchangeRate = new ExchangeRate({
        currencyName: currencyname,
        exchangeRateAmountToNaira: exchangeRateAmount,
      });
      await exchangeRate.save();
      res.json(exchangeRate);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
);

router.get("/:currencyName", async (req, res) => {
  const currencyName = req.params.currencyName;
  try {
    const exchangeRate = await ExchangeRate.findOne({
      currencyName: currencyName,
    });
    res.json(exchangeRate);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

export default router;