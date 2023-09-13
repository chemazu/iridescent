"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const walletSchema = new _mongoose.default.Schema({
  user: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "user"
  },
  amount: {
    type: Number
  },
  actualPayout: {
    type: Number
  },
  status: {
    type: String
  },
  transferrecipient: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "bankdetails"
  },
  transferreference: {
    type: String
  },
  recipientcode: {
    type: String
  },
  withdrawaldate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Wallet = _mongoose.default.model("wallet", walletSchema);

var _default = Wallet;
exports.default = _default;