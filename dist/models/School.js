"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const schoolSchema = new _mongoose.default.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  about: {
    type: String
  },
  themename: {
    type: String
  },
  themepreviewid: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "themepreview"
  },
  testimonials: [{
    testifiedby: {
      type: String
    },
    testifiertext: {
      type: String
    }
  }],
  createdBy: {
    type: _mongoose.default.Schema.Types.ObjectId,
    required: true,
    ref: "user"
  },
  courses: [{
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "course"
  }],
  erolledstudent: [{
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "student"
  }]
}, {
  timestamps: true
});

const School = _mongoose.default.model("school", schoolSchema);

var _default = School;
exports.default = _default;