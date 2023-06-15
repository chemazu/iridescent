"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const paymentPlansSchema = new _mongoose.default.Schema({
  planname: {
    type: String
  },
  coursecount: {
    type: Number
  },
  productcount: {
    type: Number
  },
  percentchargepercoursesale: {
    type: Number
  },
  planprice: {
    type: Number
  },
  totaluploadsize: {
    // saved in MB(megabytes)
    type: Number
  },
  studentsize: {
    type: String
  },
  videouploadsize: {
    // saved in MB(megabytes)
    type: Number
  },
  instantpayout: {
    type: Boolean
  },
  productsupport: {
    type: Boolean
  },
  coursedesigntemplate: {
    type: Boolean
  },
  paystackplancode: {
    type: String
  }
}, {
  timestamps: true
});

const PaymentPlans = _mongoose.default.model("paymentplans", paymentPlansSchema);

var _default = PaymentPlans;
exports.default = _default;