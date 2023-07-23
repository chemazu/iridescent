"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const liveWebinarSchema = new _mongoose.default.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  streamKey: {
    type: String,
    required: true,
    unique: true
  },
  streamUrl: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  isLive: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  thumbnail: {
    type: String
  },
  webinarthumbnailid: {
    type: String
  },
  viewers: [{
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "user"
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ["Daily", "daily", "weekly", "monthly", "Weekly", "Monthly", ""],
    default: "Daily"
  },
  recurringDays: [{
    type: Number,
    min: 0,
    max: 6
  }],
  endTime: {
    type: Date
  },
  fee: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: "NGN"
  },
  category: {
    type: String,
    required: true
  },
  timeleft: {
    type: Number
  },
  streamStarted: {},
  creator: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  school: {
    type: _mongoose.default.Schema.Types.ObjectId,
    required: true,
    ref: "school"
  }
});

const LiveWebinar = _mongoose.default.model("LiveWebinar", liveWebinarSchema);

var _default = LiveWebinar;
exports.default = _default;