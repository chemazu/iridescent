"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _mongoosePaginateV = _interopRequireDefault(require("mongoose-paginate-v2"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const replySchema = new _mongoose.default.Schema({
  username: {
    type: String
  },
  replyavatar: {
    type: String
  },
  text: {
    type: String,
    trim: true,
    required: true
  },
  comment: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "comment",
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
  replyby: {
    type: _mongoose.default.Schema.Types.ObjectId
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});
replySchema.plugin(_mongoosePaginateV.default);

const Reply = _mongoose.default.model("reply", replySchema);

var _default = Reply;
exports.default = _default;