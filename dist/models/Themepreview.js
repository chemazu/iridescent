"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const themePreviewSchema = new _mongoose.default.Schema({
  name: {
    type: String,
    unique: true
  },
  thumbnail: {
    type: String
  },
  requiredsetions: {
    type: [{
      name: {
        type: String
      },
      usesecondarycolorscheme: {
        type: Boolean,
        default: false
      },
      alternatecolumns: {
        type: Boolean,
        default: false
      }
    }],
    required: true
  },
  themedefaultstyles: {
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
  }
}, {
  timestamps: true
});

const Themepreview = _mongoose.default.model("themepreview", themePreviewSchema);

var _default = Themepreview;
exports.default = _default;