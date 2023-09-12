"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const orderSchema = new _mongoose.default.Schema({
  reference: {
    type: String
  },
  boughtfrom: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "user"
  },
  orderfrom: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "student"
  },
  orderedcourse: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "course"
  },
  tutor: {
    // the tutor property is what we use to keep track of tutuors who's courses or products we're purchased
    // courses.tuturly account
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "tutor"
  },
  createdVia: {
    type: String,
    enum: ["callback", "webhook"]
  },
  amount: {
    type: Number
  },
  amount_usd: {
    type: Number
  },
  ordertype: {
    type: String
  },
  actualearning: {
    type: Number
  },
  actualearning_usd: {
    type: Number
  },
  orderdate: {
    type: Date,
    default: Date.now
  },
  pendingOrderDate: {
    type: Date
  }
}, {
  timestamps: true
});
orderSchema.index({
  reference: 1
});
orderSchema.index({
  boughtfrom: 1
});
orderSchema.index({
  orderdate: 1
});
orderSchema.index({
  boughtfrom: 1,
  orderdate: 1
});

orderSchema.methods.setPendingOrderDate = async function () {
  const sevenDaysAfterOrderDate = new Date(this.orderdate);
  sevenDaysAfterOrderDate.setDate(sevenDaysAfterOrderDate.getDate() + 7); // Set the amountViewDate property

  this.pendingOrderDate = sevenDaysAfterOrderDate;
};

const Order = _mongoose.default.model("order", orderSchema);

var _default = Order;
exports.default = _default;