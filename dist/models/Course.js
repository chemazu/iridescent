"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const courseSchema = new _mongoose.default.Schema({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String
  },
  category: {
    type: String
  },
  rootcategory: {
    type: String
  },
  prerequisite: {
    type: String
  },
  language: {
    type: String
  },
  level: {
    type: String
  },
  description: {
    type: String
  },
  thumbnail: {
    type: String
  },
  price: {
    type: Number
  },
  published: {
    type: Boolean,
    default: false
  },
  coursediscount: {
    type: String
  },
  coursethumbnailid: {
    type: String
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  verification_in_review: {
    type: Boolean,
    default: false
  },
  transferedToCloudflare: {
    type: Boolean
  },
  type: {
    type: String,
    default: "course"
  },
  reviews: [{
    name: {
      type: String
    },
    email: {
      // email added to keep track of user's who have already added reviews.
      //  even though it won't be displayed
      type: String
    },
    star: {
      type: Number,
      default: 0
    },
    comment: {
      type: String
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  author: {
    type: _mongoose.default.Schema.Types.ObjectId,
    required: true,
    ref: "user"
  },
  school: {
    type: _mongoose.default.Schema.Types.ObjectId,
    required: true,
    ref: "school"
  },
  coursechapters: [{
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "coursechapter"
  }],
  tutor: {
    // the tutor property is what we use to keep track of tutuors who create courses for the
    // courses.tuturly account
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "tutor"
  }
}, {
  timestamps: true
});
courseSchema.index({
  author: 1
});
courseSchema.index({
  title: 1
});
courseSchema.index({
  is_verified: 1
});
courseSchema.index({
  category: 1
});
courseSchema.index({
  title: 1,
  is_verified: 1,
  category: 1
}); // courseSchema.plugin(mongoosePaginate);

const Course = _mongoose.default.model("course", courseSchema);

var _default = Course;
exports.default = _default;