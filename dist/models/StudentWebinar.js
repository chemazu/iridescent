"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const studentWebinarSchema = new _mongoose.default.Schema({
  student: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "student"
  },
  webinarBought: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "LiveWebinar"
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
studentWebinarSchema.index({
  student: 1,
  webinarBought: 1
}, {
  unique: true
});

const StudentWebinar = _mongoose.default.model("studentWebinar", studentWebinarSchema);

var _default = StudentWebinar;
exports.default = _default;