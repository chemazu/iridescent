"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _mongoosePaginateV = _interopRequireDefault(require("mongoose-paginate-v2"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const commentSchema = new _mongoose.default.Schema({
  username: {
    type: String,
    required: true
  },
  text: {
    type: String,
    trim: true,
    required: true
  },
  courseunit: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "courseunit",
    required: true
  },
  coursechapter: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "coursechapter",
    required: true
  },
  commentby: {
    type: _mongoose.default.Schema.Types.ObjectId
  },
  date: {
    type: Date,
    default: Date.now
  },
  commentavatar: {
    type: String
  },
  reply: [{
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "reply"
  }]
}, {
  timestamps: true
});
commentSchema.plugin(_mongoosePaginateV.default);

const Comment = _mongoose.default.model("comment", commentSchema);

var _default = Comment;
exports.default = _default;