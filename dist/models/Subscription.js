"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const subscriptionSchema = new _mongoose.default.Schema({
  user: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "user"
  },
  subscription_plan: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "paymentplans"
  },
  amount: {
    type: Number
  }
}, {
  timestamps: true
});
subscriptionSchema.index({
  user: 1
});
subscriptionSchema.index({
  subscription_plan: 1
});

const Subscription = _mongoose.default.model("subscription", subscriptionSchema);

var _default = Subscription;
exports.default = _default;