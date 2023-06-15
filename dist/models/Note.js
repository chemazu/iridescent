"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const notesSchema = new _mongoose.default.Schema({
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: String,
    required: true
  },
  createdby: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "student"
  },
  courseunit: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "courseunit"
  }
}, {
  timestamps: true
});

const Note = _mongoose.default.model("notes", notesSchema);

var _default = Note;
exports.default = _default;