"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const courseUnitSchema = new _mongoose.default.Schema({
  name: {
    type: String,
    required: true
  },
  videourl: {
    type: String
  },
  cloudflare_hsl_videourl: {
    type: String
  },
  cloudflare_dash_videourl: {
    type: String
  },
  cloudflare_error_message: {
    type: String
  },
  isStreamReady: {
    type: Boolean
  },
  isCloudflareVideoSource: {
    type: Boolean
  },
  isCloudflareVideoErrorState: {
    type: Boolean,
    default: false
  },
  pdfUrl: {
    type: String
  },
  pdfName: {
    type: String
  },
  pdfFileSize: {
    type: Number
  },
  pdfPublicId: {
    type: String
  },
  isPdf: {
    type: Boolean
  },
  videothumbnail: {
    type: String
  },
  position: {
    type: Number
  },
  videopublicid: {
    type: String
  },
  is_preview_able: {
    type: Boolean,
    default: false
  },
  attachment: [{
    url: {
      type: String
    },
    filename: {
      type: String
    },
    attachmentId: {
      type: String
    }
  }],
  file_size: {
    type: Number
  },
  duration: {
    type: String
  },
  author: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "user"
  },
  comments: [{
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "comment"
  }],
  course: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "course",
    required: true
  },
  coursechapter: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "coursechapter",
    required: true
  }
}, {
  timestamps: true
});
courseUnitSchema.index({
  name: 1
});
courseUnitSchema.index({
  author: 1
});
courseUnitSchema.index({
  course: 1
});
courseUnitSchema.index({
  isStreamReady: 1
});
courseUnitSchema.index({
  is_preview_able: 1
});
courseUnitSchema.index({
  is_preview_able: 1,
  course: 1
});
courseUnitSchema.index({
  isStreamReady: 1,
  course: 1
});

const CourseUnit = _mongoose.default.model("courseunit", courseUnitSchema);

var _default = CourseUnit;
exports.default = _default;