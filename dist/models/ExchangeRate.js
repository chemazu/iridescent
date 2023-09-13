"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const exchangeRateSchema = new _mongoose.default.Schema({
  currencyName: {
    type: String
  },
  exchangeRateAmountToNaira: {
    type: Number
  }
});

const ExchangeRate = _mongoose.default.model("exchangerate", exchangeRateSchema);

var _default = ExchangeRate;
exports.default = _default;