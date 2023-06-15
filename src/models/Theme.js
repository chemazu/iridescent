import mongoose from "mongoose";

const themeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "school",
    },
    logo: {
      type: String,
      default: "",
    },
    logocloudid: {
      type: String,
    },
    favicon: {
      type: String,
      default: "",
    },
    faviconcloudid: {
      type: String,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    address: {
      type: String,
    },
    themestyles: {
      primarybackgroundcolor: {
        type: String,
      },
      primarytextcolor: {
        type: String,
      },
      secondarybackgroundcolor: {
        type: String,
      },
      secondarytextcolor: {
        type: String,
      },
      secondarypagebackgroundcolor: {
        type: String,
      },
      fontfamily: {
        type: String,
      },
      buttonbackgroundcolor: {
        type: String,
      },
      buttontextcolor: {
        type: String,
      },
      buttonaltbackgroundcolor: {
        type: String,
      },
      buttonalttextcolor: {
        type: String,
      },
      buttonborderradius: {
        type: String,
      },
      coursecardbackgroundcolor: {
        type: String,
      },
      coursecardtextcolor: {
        type: String,
      },
      coursecardhasShadow: {
        type: Boolean,
        default: false,
      },
      navbarbackgroundcolor: {
        type: String,
      },
      navbartextcolor: {
        type: String,
      },
      footertextcolor: {
        type: String,
      },
      footerbackgroundcolor: {
        type: String,
      },
    },
    defaultassets: {
      defaultgalleryimage1: {
        type: String,
      },
      defaultgalleryimage2: {
        type: String,
      },
      defaultgalleryimage3: {
        type: String,
      },
      defaultcalltoactionheroimage: {
        type: String,
      },
      defaultimageandtextimage: {
        type: String,
      },
      defaultimageandtextimagealt: {
        type: String,
      },
      defaultheadertextandimage: {
        type: String,
      },
      defaultheaderheroimage: {
        type: String,
      },
    },
    facebookurl: {
      type: String,
      default: "",
    },
    instagramurl: {
      type: String,
      default: "",
    },
    twitterurl: {
      type: String,
      default: "",
    },
    googleurl: {
      type: String,
      default: "",
    },
    youtubeurl: {
      type: String,
      default: "",
    },
    phonenumber: {
      type: String,
      default: "",
    },
    countryphonecode: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Theme = mongoose.model("theme", themeSchema);

export default Theme;
