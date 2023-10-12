import ExchangeRate from "../models/ExchangeRate";

const convertNairaToDollar = async (amountInNaira, currencyName) => {
  try {
    const exchangeRate = await ExchangeRate.findOne({
      currencyName: currencyName,
    });
    const amountInQuoteCurrency =
      amountInNaira / exchangeRate.exchangeRateAmountToNaira;
    return amountInQuoteCurrency;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export default convertNairaToDollar;
