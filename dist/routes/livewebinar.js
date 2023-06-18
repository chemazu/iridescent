"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _uuid = require("uuid");

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _studentAuth = _interopRequireDefault(require("../middleware/studentAuth"));

var _cloudinary = _interopRequireDefault(require("cloudinary"));

var _multer = _interopRequireWildcard(require("multer"));

var _express = require("express");

var _Livewebinar = _interopRequireDefault(require("../models/Livewebinar"));

var _School = _interopRequireDefault(require("../models/School"));

var _expressValidator = require("express-validator");

var _User = _interopRequireDefault(require("../models/User"));

var _Student = _interopRequireDefault(require("../models/Student"));

var _PaymentPlans = _interopRequireDefault(require("../models/PaymentPlans"));

var _dataUri = _interopRequireDefault(require("../utilities/dataUri"));

var _StudentWebinar = _interopRequireDefault(require("../models/StudentWebinar"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = (0, _express.Router)();
const storageDest = (0, _multer.memoryStorage)();
const createCourseThumbnailPhoto = (0, _multer.default)({
  storage: storageDest,

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|PNG|JPG|JPEG)$/)) {
      return cb(new Error("Please Upload another Image"));
    }

    cb(undefined, true);
  }

}); // const uploadFileToCloudinary = (file, options) => {
//   return new Promise((resolve, reject) => {
//     cloudinary.v2.uploader.upload(file, options, (error, response) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(response);
//         console.log(response);
//       }
//     });
//   });
// };
// Create a live stream

router.post("/", [_auth.default, createCourseThumbnailPhoto.single("file"), (0, _expressValidator.body)("title", "title is required").not().isEmpty(), (0, _expressValidator.body)("description", "description is required").not().isEmpty(), (0, _expressValidator.body)("isRecurring", "isRecurring is required").not().isEmpty(), (0, _expressValidator.body)("fee", "fee is required").not().isEmpty(), (0, _expressValidator.body)("category", "category is required").not().isEmpty(), (0, _expressValidator.body)("startTime", "startTime is required").not().isEmpty(), (0, _expressValidator.body)("currency", "currency is required").not().isEmpty()], async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req.body);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const {
    isRecurring,
    startTime,
    endTime,
    title,
    category,
    description,
    fee,
    currency,
    customRep,
    recurringFrequency,
    webinarReps
  } = req.body;
  const streamKey = (0, _uuid.v4)();
  const streamUrl = `${streamKey}`;
  const creator = req.user.id;
  const creatorSchool = await _School.default.findOne({
    createdBy: req.user.id
  });
  const school = creatorSchool._id;
  const fileType = `.${req.file.originalname.split(".")[req.file.originalname.split(".").length - 1]}`;
  const imageToBeUploaded = (0, _dataUri.default)(`${fileType}`, req.file.buffer).content;
  const uploadResponse = await _cloudinary.default.v2.uploader.upload(imageToBeUploaded, {
    folder: `tuturly/webinar/${title}`
  });
  const newStream = new _Livewebinar.default({
    title,
    description,
    streamKey,
    streamUrl,
    startTime,
    isRecurring,
    currency,
    fee,
    thumbnail: uploadResponse.secure_url,
    webinarthumbnailid: uploadResponse.public_id,
    category,
    creator,
    customRep,
    recurringFrequency,
    webinarReps,
    endTime,
    school
  }); // let options = {
  //   folder: `tuturly/livewebinar/${title}`,
  //   resource_type: "image",
  // };

  try {
    // const [thumbnailUploadResponse] = await uploadFileToCloudinary(
    //   image,
    //   options
    // );
    const savedStream = await newStream.save();
    res.json({
      message: "Stream created successfully",
      streamKey: savedStream.streamKey,
      uniqueLink: savedStream.uniqueLink
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Server error"
    });
  }
}); // confirm a live stream

router.get("/watch/:streamKey", async (req, res) => {
  const {
    streamKey
  } = req.params;

  try {
    const livestream = await _Livewebinar.default.findOne({
      streamKey
    }).populate("creator").populate("school");
    let payment = await _PaymentPlans.default.findOne(livestream.creator.selectedplan);
    const timestamp = Date.now();
    console.log(livestream);

    if (livestream && payment) {
      livestream.streamStarted = timestamp;

      if (livestream.timeleft === 0) {
        livestream.timeleft = 2700;
      }

      await livestream.save();
      res.json({
        title: livestream.title,
        streamkey: livestream.streamKey,
        isLive: livestream.isLive,
        firstname: livestream.creator.firstname,
        lastname: livestream.creator.lastname,
        username: livestream.creator.username,
        school: livestream.school.name,
        planname: payment.planname,
        timeLeft: livestream.timeleft
      });
    } // check if they are validate for the livestream registered to the course or check a password
    // res.json({ error: "Stream not found" });

  } catch (error) {
    // res.json({ error: "Server error" });
    console.log(error);
  }
}); // get live streams

router.get("/streams", _auth.default, async (req, res) => {
  // the query only returns the webinars whose startTime is greater than or equal to the current date/time
  let streams = await _Livewebinar.default.find({
    creator: req.user.id // startTime: { $gte: new Date() },

  }).sort({
    startTime: 1
  });

  if (!streams) {
    return res.json({
      error: "Stream not found"
    });
  }

  res.json({
    streams
  });
});
router.get("/schoolstreams/:schoolName", async (req, res) => {
  let {
    schoolName
  } = req.params;
  let school = await _School.default.findOne({
    name: schoolName
  });
  let streams = await _Livewebinar.default.find({
    creator: school.createdBy // startTime: { $gte: new Date() },

  }).sort({
    startTime: 1
  });

  if (!streams) {
    return res.json({
      error: "Stream not found"
    });
  }

  res.json({
    streams
  });
});
router.get("/streamdetails/:streamId", async (req, res) => {
  const {
    streamId
  } = req.params;

  try {
    const livestream = await _Livewebinar.default.findOne({
      _id: streamId
    });

    if (livestream) {
      res.json(livestream);
    }
  } catch (error) {
    // res.json({ error: "Server error" });
    console.log(error);
  }
}); // get user details

router.get("/studentdetails", _studentAuth.default, async (req, res) => {
  let user = await _Student.default.findOne({
    _id: req.student.id
  });
  res.json({
    username: user.username
  });
}); // Start the server
// router.get("/purge", async () => {
// await LiveWebinar.deleteMany({});
//   await StudentWebinar.deleteMany({});
//   console.log("All documents deleted successfully.");
// });

var _default = router;
exports.default = _default;