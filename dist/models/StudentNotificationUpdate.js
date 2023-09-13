"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const studentNotificationUpdateSchema = new _mongoose.default.Schema({
  student: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "student"
  },
  count: {
    type: Number
  },
  inView: {
    type: Boolean,
    default: false
  }
});

const StudentNotificationUpdate = _mongoose.default.model("studentNotificationupdate", studentNotificationUpdateSchema);

var _default = StudentNotificationUpdate;
exports.default = _default;