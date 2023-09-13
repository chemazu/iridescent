"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const reportSchema = new _mongoose.default.Schema({
  school: {
    type: _mongoose.default.Schema.Types.ObjectId,
    required: true,
    ref: "school"
  },
  course: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "course"
  },
  courseunitid: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "courseunit"
  },
  tutuor: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "user"
  },
  student: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "student"
  },
  reason: {
    type: String,
    required: true
  },
  seen: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

const Report = _mongoose.default.model("report", reportSchema);

var _default = Report;
exports.default = _default;