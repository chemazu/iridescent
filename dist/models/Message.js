"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const messageSchema = new _mongoose.default.Schema({
  sender: {
    type: _mongoose.default.Schema.Types.ObjectId,
    required: true,
    ref: "user"
  },
  recipient: {
    type: _mongoose.default.Schema.Types.ObjectId,
    required: true,
    ref: "user"
  },
  text: {
    type: String,
    required: true
  },
  readstatus: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Message = _mongoose.default.model("message", messageSchema);

var _default = Message;
exports.default = _default;