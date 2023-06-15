"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const courseChapterSchema = new _mongoose.default.Schema({
  name: {
    type: String
  },
  course: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "course"
  },
  author: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "user"
  },
  courseunit: [{
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "courseunit"
  }]
}, {
  timestamps: true
});
courseChapterSchema.index({
  author: 1
});

const CourseChapter = _mongoose.default.model("coursechapter", courseChapterSchema);

var _default = CourseChapter;
exports.default = _default;