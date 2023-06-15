"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rootCategorySchema = new _mongoose.default.Schema({
  title: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

const RootCategory = _mongoose.default.model("rootCategory", rootCategorySchema);

var _default = RootCategory;
exports.default = _default;