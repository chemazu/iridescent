"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const courseVerificationApplicationSchema = new _mongoose.default.Schema({
  course_id: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "course"
  },
  title: {
    type: String
  },
  course_author: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "user"
  },
  verified_by: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "user"
  },
  is_verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const CourseVerificationApplication = _mongoose.default.model("courseverificationapplication", courseVerificationApplicationSchema);

var _default = CourseVerificationApplication;
exports.default = _default;