"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const studentProductSchema = new _mongoose.default.Schema({
  student: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "student"
  },
  productBought: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "product"
  },
  boughtfrom: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "school"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});
studentProductSchema.index({
  student: 1,
  productBought: 1
}, {
  unique: true
});

const StudentProduct = _mongoose.default.model("studentProduct", studentProductSchema);

var _default = StudentProduct;
exports.default = _default;