"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const studentCourseSchema = new _mongoose.default.Schema({
  student: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "student"
  },
  coursebought: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "course"
  },
  boughtfrom: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "school"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  coursemoduleinview: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "coursechapter",
    default: null
  },
  courseunitlastviewed: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "courseunit",
    default: null
  },
  unitprogresstimestamp: {
    type: String,
    default: "0"
  }
}, {
  timestamps: true
});
studentCourseSchema.index({
  student: 1,
  coursebought: 1
}, {
  unique: true
});

const StudentCourse = _mongoose.default.model("studentcourse", studentCourseSchema);

var _default = StudentCourse;
exports.default = _default;