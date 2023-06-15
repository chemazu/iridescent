"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const studentSchema = new _mongoose.default.Schema({
  firstname: {
    type: String
  },
  lastname: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  username: {
    type: String
  },
  avatar: {
    type: String
  },
  password: {
    type: String
  },
  enrolledTo: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "school"
  }
}, {
  timestamps: true
});
studentSchema.index({
  email: 1
});
studentSchema.index({
  username: 1
});

const Student = _mongoose.default.model("student", studentSchema);

var _default = Student;
exports.default = _default;