"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const PrelaunchEmailSchema = new _mongoose.default.Schema({
  email: {
    type: String
  }
}, {
  timestamps: true
});
PrelaunchEmailSchema.index({
  email: 1
});

const PrelaunchEmail = _mongoose.default.model("prelaunchemail", PrelaunchEmailSchema);

var _default = PrelaunchEmail;
exports.default = _default;