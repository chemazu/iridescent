"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const courseTypeSchema = new _mongoose.default.Schema({
  title: {
    type: String
  },
  rootcategory: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "rootcategory"
  }
}, {
  timestamps: true
});

const CourseType = _mongoose.default.model("courseType", courseTypeSchema);

var _default = CourseType;
exports.default = _default;