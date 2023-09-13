"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const sectionSchema = new _mongoose.default.Schema({
  name: {
    type: String
  },
  position: {
    type: Number
  },
  userId: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "user"
  },
  schoolId: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "school"
  },
  isusingsecondarystyles: {
    type: Boolean,
    default: false
  },
  parenttheme: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "theme"
  },
  issystemcreatedsection: {
    type: Boolean,
    required: true,
    default: false
  },
  alternatecolumns: {
    type: Boolean,
    default: false
  },
  // gallery points to the three column image gallery section
  // user images would be populated here
  galleryimageurls: {
    header: {
      type: String,
      default: "Check Out Some Of Our Recent Projects."
    },
    imageone: {
      type: String
    },
    imageonepublicid: {
      type: String
    },
    imagetwo: {
      type: String
    },
    imagetwopublicid: {
      type: String
    },
    imagethree: {
      type: String
    },
    imagethreepublicid: {
      type: String
    }
  },
  // image and text section
  // for image on one side and text on another
  imageandtext: {
    header: {
      type: String,
      default: "We are a Multidisciplinary Creative Industry"
    },
    subtitle: {
      type: String,
      default: "We Are Happy, When Our Clients Are Happy..."
    },
    description: {
      type: String,
      default: "We Work Together, to design, create and produce work that we are proud of for folks that we believe in. We would be more than happy to work on your project. To help you business evolve to the next level"
    },
    imageurl: {
      type: String
    },
    imagepublicid: {
      type: String
    }
  },
  // text overlay with image background
  textimageoverlay: {
    headertext: {
      type: String,
      default: "Let's look at a few examples of descriptions on gallery pages"
    },
    text: {
      type: String,
      default: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Commodi omnis deserunt facere necessitatibus itaque tempora dolorum impedit nam corporis, quae fuga? Aut fugit iusto recusandae in optio nemo molestiae sequi! Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt porro ipsa, odit ea, eius incidunt doloribus corporis vel eaque, laborum autem rem reprehenderit totam hic consequuntur veniam? Ullam, laborum modi."
    }
  },
  // for the video section
  video: {
    videourl: {
      type: String
    },
    videopublicid: {
      type: String
    },
    isvideofullscreen: {
      type: Boolean,
      default: false
    },
    headertext: {
      type: String
    },
    isStreamReady: {
      type: Boolean
    },
    videoSize: {
      type: Number
    },
    videoDuration: {
      type: String
    },
    isCloudflareVideoSource: {
      type: Boolean
    },
    cloudflare_hsl_videourl: {
      type: String
    },
    cloudflare_dash_videourl: {
      type: String
    },
    isCloudflareVideoErrorState: {
      type: Boolean
    },
    cloudflare_error_message: {
      type: String
    }
  },
  // for the call to action section
  // for hero type sections
  calltoaction: {
    headertitle: {
      type: String,
      default: "This is the call to action main header. Include Call To Action Phrase Here."
    },
    description: {
      type: String,
      default: "This is the call to Call to action subtitles text. this part contains more information on what you want your student to do!"
    },
    imageurl: {
      type: String
    },
    imagepublicid: {
      type: String
    },
    buttonurl: {
      type: String
    },
    showsociallinks: {
      type: Boolean,
      default: false
    },
    btntext: {
      type: String,
      default: "Enroll"
    }
  },
  // for the checklist section
  textandchecklist: {
    text: {
      type: String,
      default: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo repellat incidunt modi? Rem, fugiat neque provident atque commodi eaque quibusdam? Quo ipsum dolor officiis alias eaque laudantium, explicabo odio sequi."
    },
    checklist: {
      type: [Object],
      default: [{
        icon: "fa-check",
        text: "Make Friends."
      }, {
        icon: "fa-check",
        text: "Study diligently and attend all classes."
      }, {
        icon: "fa-check",
        text: "Obey Our School Conduct of Conduct and Policy"
      }]
    }
  },
  // [
  //     {
  //         icon: {
  //             type: String,
  //             default: "fa-check"
  //         },
  //         text: String
  //     },
  // ]
  // header text and image section
  // this type of text and image section is often used
  // in the header part of the site
  headertextandimage: {
    header: {
      type: String,
      default: "Being the strategic part of the page that people see in the first seconds of loading a website."
    },
    subtitle: {
      type: String,
      default: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Qui, natus? Est sapiente quasi voluptates voluptatem recusandae sint dicta debitis porro eligendi veritatis repellendus aut nemo ipsa maxime mollitia, temporibus voluptatum"
    },
    imageurl: {
      type: String
    },
    imagepublicid: {
      type: String
    },
    showsociallinks: {
      type: Boolean,
      default: true
    }
  },
  // header text and hero image section
  // this type of section is used in the header part
  // this is a hero based section
  headertextheroimage: {
    header: {
      type: String,
      default: "Learn How To Control And Expand Your Business"
    },
    subtitle: {
      type: String,
      default: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad sequi odit, quisquam dolore illum tenetur magni quam rerum sint qui corrupti dignissimos velit ea beatae molestias! Quod quasi modi quo."
    },
    heroimageurl: {
      type: String
    },
    imagepublicid: {
      type: String
    },
    showsociallinks: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});
sectionSchema.index({
  name: 1
});
sectionSchema.index({
  userId: 1
});
sectionSchema.index({
  schoolId: 1
});
sectionSchema.index({
  name: 1,
  userId: 1
});

const Section = _mongoose.default.model("section", sectionSchema);

var _default = Section;
exports.default = _default;