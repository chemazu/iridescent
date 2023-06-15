"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const productTypeSchema = new _mongoose.default.Schema({
  title: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

const ProductType = _mongoose.default.model("productType", productTypeSchema);

var _default = ProductType;
exports.default = _default;