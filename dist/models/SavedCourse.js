"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const savedCourseSchema = new _mongoose.default.Schema({
  savedby: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "student"
  },
  savedfrom: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "school"
  },
  course: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "course"
  }
}, {
  timestamps: true
});

const SavedCourse = _mongoose.default.model("savedcourse", savedCourseSchema);

var _default = SavedCourse;
exports.default = _default;