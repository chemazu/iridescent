import mongoose from "mongoose";

const exchangeRateSchema = new mongoose.Schema({
  currencyName: {
    type: String,
  },
  exchangeRateAmountToNaira: {
    type: Number,
  },
});

const ExchangeRate = mongoose.model("exchangerate", exchangeRateSchema);

export default ExchangeRate;
