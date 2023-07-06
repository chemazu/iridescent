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

});
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
  }); // {
  //   isRecurring: 'false',
  //   title: 'one',
  //   category: 'Business',
  //   description: 'egg',
  //   fee: '1000',
  //   currency: 'USD',
  //   customRep: '',
  //   recurringFrequency: '',
  //   webinarReps: '',
  //   startTime: 'Tue Jun 27 2023 13:40:00 GMT+0100 (West Africa Standard Time)',
  //   endDate: 'Invalid Date'
  // }
  // {
  //   isRecurring: 'true',
  //   title: '10000',
  //   category: 'Automobiles',
  //   description: 'popop',
  //   fee: '10322',
  //   currency: 'USD',
  //   customRep: '',
  //   recurringFrequency: 'weekly',
  //   webinarReps: 'Every 2 weeks',
  //   startTime: 'Thu Jun 29 2023 13:50:00 GMT+0100 (West Africa Standard Time)',
  //   endDate: 'Thu Jun 29 2023 19:50:00 GMT+0100 (West Africa Standard Time)'
  // }

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
    school,
    timeleft: 2700
  });

  try {
    const savedStream = await newStream.save();
    res.json({
      message: "Stream created successfully",
      streamKey: savedStream.streamKey,
      uniqueLink: savedStream.uniqueLink,
      id: savedStream._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Server error"
    });
  }
});
router.put("/:id", [_auth.default, createCourseThumbnailPhoto.single("file"), (0, _expressValidator.body)("title", "title is required").not().isEmpty(), (0, _expressValidator.body)("description", "description is required").not().isEmpty(), (0, _expressValidator.body)("isRecurring", "isRecurring is required").not().isEmpty(), (0, _expressValidator.body)("fee", "fee is required").not().isEmpty(), (0, _expressValidator.body)("category", "category is required").not().isEmpty(), (0, _expressValidator.body)("startTime", "startTime is required").not().isEmpty(), (0, _expressValidator.body)("currency", "currency is required").not().isEmpty()], async (req, res) => {
  console.log("ferer");
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

  try {
    const existingWebinar = await _Livewebinar.default.findById(req.params.id);

    if (!existingWebinar) {
      return res.status(404).json({
        error: "Webinar not found"
      });
    }

    existingWebinar.title = title;
    existingWebinar.description = description;
    existingWebinar.isRecurring = isRecurring;
    existingWebinar.startTime = startTime;
    existingWebinar.endTime = endTime;
    existingWebinar.category = category;
    existingWebinar.fee = fee;
    existingWebinar.currency = currency;
    existingWebinar.customRep = customRep;
    existingWebinar.recurringFrequency = recurringFrequency;
    existingWebinar.webinarReps = webinarReps;

    if (req.file) {
      const fileType = `.${req.file.originalname.split(".")[req.file.originalname.split(".").length - 1]}`;
      const imageToBeUploaded = (0, _dataUri.default)(`${fileType}`, req.file.buffer);
      const uploadResponse = await _cloudinary.default.v2.uploader.upload(imageToBeUploaded.content, {
        folder: `tuturly/webinar/${title}`
      });
      existingWebinar.thumbnail = uploadResponse.secure_url;
      existingWebinar.webinarthumbnailid = uploadResponse.public_id;
    }

    const updatedWebinar = await existingWebinar.save();
    res.json({
      message: "Webinar updated successfully",
      streamKey: updatedWebinar.streamKey,
      uniqueLink: updatedWebinar.uniqueLink,
      id: updatedWebinar._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Server error"
    });
  }
}); // confirm a live stream

router.get("/stream/:streamKey", _auth.default, async (req, res) => {
  const {
    streamKey
  } = req.params;
  let user = req.user.id;

  try {
    const livestream = await _Livewebinar.default.findOne({
      streamKey,
      creator: user
    }).populate("creator").populate("school");

    if (livestream) {
      const payment = await _PaymentPlans.default.findOne({
        _id: livestream.creator.selectedplan
      });
      const timestamp = Date.now();

      if (payment) {
        livestream.streamStarted = timestamp;
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
          timeLeft: livestream.timeleft,
          avatar: livestream.creator.avatar,
          id: livestream._id
        });
      } else {
        res.status(400).json({
          error: "Payment plan not found"
        });
      }
    } else {
      res.status(400).json({
        error: "Stream not found"
      });
    }
  } catch (error) {
    res.status(400).json({
      error: "Server error"
    });
  }
});
router.get("/watch/:streamKey", _studentAuth.default, async (req, res) => {
  const {
    streamKey
  } = req.params;
  let studentId = req.student.id;

  try {
    const livestream = await _Livewebinar.default.findOne({
      streamKey
    }).populate("creator").populate("school");

    if (livestream) {
      const payment = await _StudentWebinar.default.findOne({
        student: studentId,
        webinarBought: livestream._id,
        boughtfrom: livestream.school._id
      });

      if (payment) {
        // livestream.streamStarted = timestamp;
        // if (livestream.timeleft === 0) {
        //   livestream.timeleft = 2700;
        // }
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
          timeLeft: livestream.timeleft,
          avatar: livestream.creator.avatar
        });
      } else {
        res.status(400).json({
          error: "Payment plan not found"
        });
      }
    } else {
      res.status(400).json({
        error: "Stream not found"
      });
    }
  } catch (error) {
    res.status(400).json({
      error: "Server error"
    });
  }
}); // get live streams

router.get("/streams", _auth.default, async (req, res) => {
  // the query only returns the webinars whose startTime is greater than or equal to the current date/time
  const currentDate = new Date();
  const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  let streams = await _Livewebinar.default.find({
    creator: req.user.id,
    startTime: {
      $gte: currentDateOnly
    }
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
}); // get user payment details

router.get("/studentPayment/:schoolname", _studentAuth.default, async (req, res) => {
  try {
    let studentId = req.student.id;
    const schoolname = req.params.schoolname;
    const school = await _School.default.findOne({
      name: schoolname
    });

    if (!school) {
      return res.status(400).json({
        errors: [{
          msg: "school not found"
        }]
      });
    }

    const studentPayment = await _StudentWebinar.default.findOne({
      student: studentId,
      boughtfrom: school._id
    }).populate("course");

    if (studentPayment) {
      res.json(studentPayment);
    } else {
      return res.status(400).json({
        errors: [{
          msg: "payment not found"
        }]
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});
router.get('/users-data', async (req, res) => {
  try {
    const users = await _User.default.find();
    const usersWithCourses = await _User.default.find().populate('courses');
    const usersWithHighSales = await _User.default.aggregate([{
      $lookup: {
        from: 'orders',
        // Assuming the collection name for Order model is 'orders'
        localField: '_id',
        foreignField: 'boughtfrom',
        as: 'orders'
      }
    }, {
      $group: {
        _id: '$user',
        totalSales: {
          $sum: '$orders.amount'
        }
      }
    }, {
      $match: {
        totalSales: {
          $gte: 1000
        } // Adjust the threshold as needed

      }
    }]);
    const usersWithLowSales = await _User.default.aggregate([{
      $lookup: {
        from: 'orders',
        // Assuming the collection name for Order model is 'orders'
        localField: '_id',
        foreignField: 'boughtfrom',
        as: 'orders'
      }
    }, {
      $group: {
        _id: '$user',
        totalSales: {
          $sum: '$orders.amount'
        }
      }
    }, {
      $match: {
        totalSales: {
          $lte: 100
        } // Adjust the threshold as needed

      }
    }]);
    res.json({
      allUsers: users // usersWithCourses,
      // usersWithHighSales,
      // usersWithLowSales,

    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve data'
    });
  }
}); // clear the server
// router.get("/purge", async (req,res) => {
//   await StudentWebinar.deleteMany({});
//   await LiveWebinar.deleteMany({});
//   console.log("All documents deleted successfully.");
// });

var _default = router;
exports.default = _default;