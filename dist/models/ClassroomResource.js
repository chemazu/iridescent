"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const optionSchema = new _mongoose.default.Schema({
  type: {
    type: String,
    required: true
  }
});
const questionSchema = new _mongoose.default.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [],
    required: true
  }
});
const classroomResourceSchema = new _mongoose.default.Schema({
  title: {
    type: String
  },
  creator: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "user",
    // Assuming the reference model is named "User"
    required: true
  },
  persist: {
    type: Boolean,
    required: true,
    default: false
  },
  school: {
    type: _mongoose.default.Schema.Types.ObjectId,
    required: true,
    ref: "school" // Assuming the reference model is named "School"

  },
  type: {
    type: String,
    required: true
  },
  timeStamp: {
    type: Date,
    required: true
  },
  durationInSec: {
    type: Number
  },
  quizHolder: {
    type: [questionSchema] // For "quiz" type

  },
  options: {
    type: [] // For "poll" type

  },
  answers: {
    type: [] // For "quiz" type

  }
}, {
  timestamps: true
});

const ClassroomResource = _mongoose.default.model("ClassroomResource", classroomResourceSchema);

var _default = ClassroomResource;
exports.default = _default;