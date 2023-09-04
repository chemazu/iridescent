"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ExchangeRate = _interopRequireDefault(require("../models/ExchangeRate"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const convertNairaToDollar = async (amountInNaira, currencyName) => {
  try {
    const exchangeRate = await _ExchangeRate.default.findOne({
      currencyName: currencyName
    });
    const amountInQuoteCurrency = amountInNaira / exchangeRate.exchangeRateAmountToNaira;
    return amountInQuoteCurrency;
  } catch (error) {
    console.log(error);
    return error;
  }
};

var _default = convertNairaToDollar;
exports.default = _default;