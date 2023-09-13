"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const BankdetailsSchema = new _mongoose.default.Schema({
  user: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "user"
  },
  bankname: {
    type: String
  },
  accountnumber: {
    type: String
  },
  accountname: {
    type: String
  },
  bankcode: {
    type: String
  }
}, {
  timestamps: true
});

const Bankdetails = _mongoose.default.model("bankdetails", BankdetailsSchema);

var _default = Bankdetails;
exports.default = _default;