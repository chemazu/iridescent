"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const tutorialSchema = new _mongoose.default.Schema({
  videoUrl: {
    type: String
  },
  videoId: {
    type: String
  },
  title: {
    type: String
  },
  duration: {
    type: String
  }
}, {
  timestamps: true
});

const Tutorial = _mongoose.default.model("tutorial", tutorialSchema);

var _default = Tutorial;
exports.default = _default;