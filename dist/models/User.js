"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const userSchema = new _mongoose.default.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  },
  createdVia: {
    type: String
  },
  avatar: {
    type: String
  },
  cloudinaryAvatarId: {
    type: String
  },
  deviceCreatedWith: {
    type: String
  },
  firstname: {
    type: String
  },
  lastname: {
    type: String
  },
  username: {
    type: String,
    unique: true,
    sparse: true
  },
  field: {
    type: String
  },
  about: {
    type: String
  },
  setupComplete: {
    type: Boolean,
    default: false
  },
  selectedplan: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "paymentplans"
  },
  subscriptionstatus: {
    type: Boolean,
    default: true
  },
  isverified: {
    type: Boolean,
    default: false
  },
  displaywalkthrough: {
    type: Boolean,
    default: true
  },
  user_type: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  referedBy: {
    type: _mongoose.default.Schema.Types.ObjectId
  },
  segment: {
    type: Number
  },
  hasUsedPassAllotedResource: {
    type: Boolean
  },
  dateOfCancelledSubscription: {
    type: String
  },
  showNewFeatureAnnouncementModal: {
    type: Boolean,
    default: true
  },
  subscriptiondata: {
    auth_code: {
      type: String
    },
    cardending: {
      type: String
    },
    cardtype: {
      type: String
    },
    cardexpiry: {
      type: String
    },
    subscriptioncode: {
      type: String
    },
    isSubscribedToPlan: {
      type: Boolean,
      default: false
    },
    dateOfSubscription: {
      type: String
    },
    nextPaymentDate: {
      type: String
    }
  }
}, {
  timestamps: true
});
userSchema.index({
  email: 1
});
userSchema.index({
  username: 1
});

const User = _mongoose.default.model("user", userSchema);

var _default = User;
exports.default = _default;