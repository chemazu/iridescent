"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const themeSchema = new _mongoose.default.Schema({
  name: {
    type: String
  },
  schoolId: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "school"
  },
  logo: {
    type: String,
    default: ""
  },
  logocloudid: {
    type: String
  },
  favicon: {
    type: String,
    default: ""
  },
  faviconcloudid: {
    type: String
  },
  title: {
    type: String
  },
  description: {
    type: String
  },
  address: {
    type: String
  },
  themestyles: {
    primarybackgroundcolor: {
      type: String
    },
    primarytextcolor: {
      type: String
    },
    secondarybackgroundcolor: {
      type: String
    },
    secondarytextcolor: {
      type: String
    },
    secondarypagebackgroundcolor: {
      type: String
    },
    fontfamily: {
      type: String
    },
    buttonbackgroundcolor: {
      type: String
    },
    buttontextcolor: {
      type: String
    },
    buttonaltbackgroundcolor: {
      type: String
    },
    buttonalttextcolor: {
      type: String
    },
    buttonborderradius: {
      type: String
    },
    coursecardbackgroundcolor: {
      type: String
    },
    coursecardtextcolor: {
      type: String
    },
    coursecardhasShadow: {
      type: Boolean,
      default: false
    },
    navbarbackgroundcolor: {
      type: String
    },
    navbartextcolor: {
      type: String
    },
    footertextcolor: {
      type: String
    },
    footerbackgroundcolor: {
      type: String
    }
  },
  defaultassets: {
    defaultgalleryimage1: {
      type: String
    },
    defaultgalleryimage2: {
      type: String
    },
    defaultgalleryimage3: {
      type: String
    },
    defaultcalltoactionheroimage: {
      type: String
    },
    defaultimageandtextimage: {
      type: String
    },
    defaultimageandtextimagealt: {
      type: String
    },
    defaultheadertextandimage: {
      type: String
    },
    defaultheaderheroimage: {
      type: String
    }
  },
  facebookurl: {
    type: String,
    default: ""
  },
  instagramurl: {
    type: String,
    default: ""
  },
  twitterurl: {
    type: String,
    default: ""
  },
  googleurl: {
    type: String,
    default: ""
  },
  youtubeurl: {
    type: String,
    default: ""
  },
  phonenumber: {
    type: String,
    default: ""
  },
  countryphonecode: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

const Theme = _mongoose.default.model("theme", themeSchema);

var _default = Theme;
exports.default = _default;