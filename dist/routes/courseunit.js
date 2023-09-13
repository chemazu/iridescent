"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _cloudinary = _interopRequireDefault(require("cloudinary"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _expressValidator = require("express-validator");

var _multer = _interopRequireWildcard(require("multer"));

var _Course = _interopRequireDefault(require("../models/Course"));

var _CourseChapter = _interopRequireDefault(require("../models/CourseChapter"));

var _CourseUnit = _interopRequireDefault(require("../models/CourseUnit"));

var _Comment = _interopRequireDefault(require("../models/Comment"));

var _Reply = _interopRequireDefault(require("../models/Reply"));

var _Note = _interopRequireDefault(require("../models/Note"));

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _validateUserPayment = _interopRequireDefault(require("../middleware/validateUserPayment"));

var _validateUserUploadAgainstAvailableUsageQuota = _interopRequireDefault(require("../middleware/validateUserUploadAgainstAvailableUsageQuota"));

var _dataUri = _interopRequireDefault(require("../utilities/dataUri"));

var _axios = _interopRequireDefault(require("axios"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

const storageDest = (0, _multer.memoryStorage)(); // upload pdf file

const multerUploads = (0, _multer.default)({
  storageDest
}).single("document"); // upload pdf

router.post("/document/:courseId/:moduleId/:filesize", _auth.default, _validateUserPayment.default, _validateUserUploadAgainstAvailableUsageQuota.default, multerUploads, [(0, _expressValidator.body)("name", "course unit name is required").not().isEmpty()], async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  if (!req.file) {
    return res.status(400).json({
      errors: [{
        msg: "please input a file"
      }]
    });
  }

  const fileType = `.${req.file.originalname.split(".")[req.file.originalname.split(".").length - 1]}`;

  if (!fileType == `.PDF`) {
    return res.status(400).json({
      errors: [{
        msg: "only pdf files allowed"
      }]
    });
  }

  const attachmentToBeUploaded = (0, _dataUri.default)(`${fileType}`, req.file.buffer).content;
  const courseId = req.params.courseId;
  const moduleId = req.params.moduleId;

  try {
    // check and validate course from course id that is valid
    const course = await _Course.default.findOne({
      _id: courseId
    });

    if (!course) {
      return res.status(400).json({
        errors: [{
          msg: "course not valid"
        }]
      });
    }

    let uploadResponse = await _cloudinary.default.v2.uploader.upload(attachmentToBeUploaded, {
      resource_type: "auto",
      folder: `tuturly/course/${course.title}/document`,
      flags: "attachment"
    });
    let cloudToDatabase = {
      name: req.body.name,
      pdfName: req.file.originalname,
      pdfUrl: uploadResponse.secure_url,
      pdfFileSize: uploadResponse.bytes,
      pdfPublicId: uploadResponse.public_id,
      isPdf: true
    };
    const courseModule = await _CourseChapter.default.findOne({
      _id: moduleId
    });

    if (!courseModule) {
      return res.status(400).json({
        errors: [{
          msg: "module not valid"
        }]
      });
    }

    let position;
    const courseUnitPerModuleCount = await _CourseUnit.default.countDocuments({
      coursechapter: moduleId
    });

    if (courseUnitPerModuleCount === 0) {
      position = 0;
    } else {
      const courseUnitByModuleId = await _CourseUnit.default.find({
        coursechapter: moduleId
      }).sort("position");
      const positionOfTheLastItem = courseUnitByModuleId[courseUnitByModuleId.length - 1];
      position = positionOfTheLastItem.position + 1;
    }

    const courseUnitObj = new _CourseUnit.default({ ...cloudToDatabase,
      position: position,
      course: courseId,
      coursechapter: moduleId
    });
    await courseUnitObj.save(); // update courseChapter/module to save the id of the newly created
    // course unit

    courseModule.courseunit.push(courseUnitObj._id);
    await courseModule.save(); // query to get all the course modules including module with the
    // new added course unit

    const modulesWithUpdatedCourseUnit = await _CourseChapter.default.find({
      course: courseId
    }).populate("courseunit");
    res.json(modulesWithUpdatedCourseUnit);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
}); // const videoUpload = upload.single('videofile')

router.post("/:courseId/:moduleId", _auth.default, _validateUserPayment.default, [(0, _expressValidator.body)("name", "name cannot be empty").not().isEmpty(), (0, _expressValidator.body)("videourl", "video url cannot be empty").not().isEmpty(), (0, _expressValidator.body)("videopublicid", "video publicid cannot be empty").not().isEmpty(), (0, _expressValidator.body)("filesize", "video filesize cannot be empty").not().isEmpty(), (0, _expressValidator.body)("duration", "video duration cannot be empty").not().isEmpty()], async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const courseId = req.params.courseId;
  const moduleId = req.params.moduleId;
  const {
    name,
    videourl,
    videopublicid,
    filesize,
    duration,
    streamableVideoUrl
  } = req.body;

  try {
    // check and validate course from course id that is valid
    const course = await _Course.default.findOne({
      _id: courseId
    });

    if (!course) {
      return res.status(400).json({
        errors: [{
          msg: "course not valid"
        }]
      });
    }

    const courseModule = await _CourseChapter.default.findOne({
      _id: moduleId
    });

    if (!courseModule) {
      return res.status(400).json({
        errors: [{
          msg: "module not valid"
        }]
      });
    }

    let position;
    const courseUnitPerModuleCount = await _CourseUnit.default.countDocuments({
      coursechapter: moduleId
    });

    if (courseUnitPerModuleCount === 0) {
      position = 0;
    } else {
      const courseUnitByModuleId = await _CourseUnit.default.find({
        coursechapter: moduleId
      }).sort("position");
      const positionOfTheLastItem = courseUnitByModuleId[courseUnitByModuleId.length - 1];
      position = positionOfTheLastItem.position + 1;
    }

    const videoFilePathExtension = `.${videourl.split(".")[videourl.split(".").length - 1]}`;
    const courseUnitObj = new _CourseUnit.default({
      name,
      videourl: videourl,
      videopublicid: videopublicid,
      videothumbnail: videourl.replace(videoFilePathExtension, ".png"),
      streamableVideoUrl: streamableVideoUrl,
      file_size: filesize,
      duration: duration,
      course: courseId,
      coursechapter: moduleId,
      author: req.user.id,
      position: position,
      isPdf: false
    });
    await courseUnitObj.save(); // update courseChapter/module to save the id of the newly created
    // course unit

    courseModule.courseunit.push(courseUnitObj._id);
    await courseModule.save(); // query to get all the course modules including module with the
    // new added course unit

    const modulesWithUpdatedCourseUnit = await _CourseChapter.default.find({
      course: courseId
    }).populate("courseunit");
    res.json(modulesWithUpdatedCourseUnit);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});
router.get("/upload/signature/:courseId/:filesize", _auth.default, _validateUserPayment.default, _validateUserUploadAgainstAvailableUsageQuota.default, async (req, res) => {
  const courseId = req.params.courseId;
  const videoFileSize = req.params.filesize;

  if (videoFileSize > 256) {
    // conditions ensures the file size is always below 1gb
    return res.status(400).json({
      errors: [{
        msg: "Video size exceeds maximum allowed for video upload"
      }]
    });
  }

  try {
    const course = await _Course.default.findOne({
      _id: courseId
    });

    if (!course) {
      return res.status(400).json({
        errors: [{
          msg: "course not valid"
        }]
      });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = _cloudinary.default.utils.api_sign_request({
      timestamp: timestamp,
      folder: `tuturly/course/${course.title}/video` // eager: "sp_full_hd/m3u8",

    }, process.env.CLOUDINARY_API_SECRET);

    res.json({
      signature: signature,
      timestamp: timestamp,
      cloudname: process.env.CLOUDINARY_CLOUD_NAME,
      apikey: process.env.CLOUDINARY_API_KEY,
      // eager: "sp_full_hd/m3u8",
      folder: `tuturly/course/${course.title}/video`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});
router.get("/upload/url/cloudflare/:courseId/:filesize", _auth.default, _validateUserPayment.default, _validateUserUploadAgainstAvailableUsageQuota.default, async (req, res) => {
  const courseId = req.params.courseId;
  const videoFileSize = req.params.filesize;

  if (videoFileSize > 200) {
    // conditions ensures the file size is always below 256mb
    return res.status(400).json({
      errors: [{
        msg: "Video size exceeds maximum allowed for video upload"
      }]
    });
  }

  try {
    const course = await _Course.default.findOne({
      _id: courseId
    });

    if (!course) {
      return res.status(400).json({
        errors: [{
          msg: "course not valid"
        }]
      });
    }

    const config = {
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN}`
      }
    };
    const cloudflarePostUrl = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`;
    const body = JSON.stringify({
      maxDurationSeconds: 3600,
      creator: req.user.id,
      allowedOrigins: ["localhost:3000", "*.localhost:3000", "tuturly.com", "*.tuturly.com"]
    });
    const cloudflareRes = await _axios.default.post(cloudflarePostUrl, body, config);
    res.json(cloudflareRes.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}); // route to save cloudflare video data and courseUnit to DB

router.post("/upload/save/cloudflare/:courseId/:moduleId", [(0, _expressValidator.body)("name", "video title required").not().isEmpty(), (0, _expressValidator.body)("videoId", "video Id required").not().isEmpty()], _auth.default, async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const courseId = req.params.courseId;
  const moduleId = req.params.moduleId;
  const {
    name,
    videoId
  } = req.body;
  let position;

  try {
    const courseModule = await _CourseChapter.default.findOne({
      _id: moduleId
    });

    if (!courseModule) {
      return res.status(400).json({
        errors: [{
          msg: "module not valid"
        }]
      });
    }

    const courseUnitPerModuleCount = await _CourseUnit.default.countDocuments({
      coursechapter: moduleId
    });

    if (courseUnitPerModuleCount === 0) {
      position = 0;
    } else {
      const courseUnitByModuleId = await _CourseUnit.default.find({
        coursechapter: moduleId
      }).sort("position");
      const positionOfTheLastItem = courseUnitByModuleId[courseUnitByModuleId.length - 1];
      position = positionOfTheLastItem.position + 1;
    }

    const courseUnitObj = new _CourseUnit.default({
      name,
      videopublicid: videoId,
      isCloudflareVideoSource: true,
      course: courseId,
      coursechapter: moduleId,
      author: req.user.id,
      position: position,
      isStreamReady: false,
      isPdf: false
    });
    await courseUnitObj.save(); // update courseChapter/module to save the id of the newly created
    // course unit

    courseModule.courseunit.push(courseUnitObj._id);
    await courseModule.save(); // query to get all the course modules including module with the
    // new added course unit

    const modulesWithUpdatedCourseUnit = await _CourseChapter.default.find({
      course: courseId
    }).populate("courseunit");
    res.json(modulesWithUpdatedCourseUnit);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}); // route to update course units after video update replace in cloudflare

router.put("/upload/update/cloudflare/:courseId/:courseunitId", _auth.default, _validateUserPayment.default, [(0, _expressValidator.body)("videoId", "video Id is required").not().isEmpty()], async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const courseId = req.params.courseId;
  const courseUnitId = req.params.courseunitId;

  try {
    const course = await _Course.default.findOne({
      _id: courseId
    });

    if (!course) {
      return res.status(400).json({
        errors: [{
          msg: "course not valid"
        }]
      });
    }

    const courseUnit = await _CourseUnit.default.findOne({
      _id: courseUnitId
    });

    if (!courseUnit) {
      return res.status(400).json({
        errors: [{
          msg: "course unit not found"
        }]
      });
    }

    const {
      videoId
    } = req.body;
    const publicVideoIdOfUpdatedVideo = courseUnit.videopublicid;

    if (courseUnit.isCloudflareVideoSource === true) {
      // implement cloudflare delete functionality here
      // and set video stream state back to false/ or video not ready to stream
      courseUnit.isStreamReady = false;
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN}`
        }
      };
      await _axios.default.delete(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/${publicVideoIdOfUpdatedVideo}`, config);
    } else {
      courseUnit.isCloudflareVideoSource = true;
      await _cloudinary.default.v2.uploader.destroy(publicVideoIdOfUpdatedVideo, {
        resource_type: "video"
      });
    }

    courseUnit.videopublicid = videoId;
    await courseUnit.save();
    res.json(addDifferentVideoFormatsToUnitsObject(courseUnit.toObject()));
  } catch (error) {
    console.error(error);
    res.status(500).send("server");
  }
});

const addDifferentVideoFormatsToUnitsObject = courseUnit => {
  if (courseUnit.isCloudflareVideoSource === true) return courseUnit;
  const videourl = courseUnit.videourl;
  const webmvideourl = videourl.replace(".mp4", ".webm");
  const ogvvideourl = videourl.replace(".mp4", ".ogv");
  return { ...courseUnit,
    webmvideourl,
    ogvvideourl
  };
};

router.get("/:courseUnitId", _auth.default, async (req, res) => {
  const courseUnitId = req.params.courseUnitId;

  try {
    const courseUnit = await _CourseUnit.default.findOne({
      _id: courseUnitId
    });

    if (!courseUnit) {
      return res.status(400).json({
        errors: [{
          msg: "course unit not found"
        }]
      });
    }

    res.json(addDifferentVideoFormatsToUnitsObject(courseUnit.toObject()));
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
}); // update course unit name

router.put("/:courseUnitId", _auth.default, _validateUserPayment.default, [(0, _expressValidator.body)("name", "unit name cannot be empty").not().isEmpty()], async (req, res) => {
  const courseUnitId = req.params.courseUnitId;
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const {
    name
  } = req.body;

  try {
    const courseUnit = await _CourseUnit.default.findOne({
      _id: courseUnitId
    });

    if (!courseUnit) {
      return res.status(400).json({
        errors: [{
          msg: "course unit not found"
        }]
      });
    }

    courseUnit.name = name;
    await courseUnit.save();
    res.json(addDifferentVideoFormatsToUnitsObject(courseUnit.toObject()));
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
}); // route to set courseunit ID

router.put("/preview/:courseUnitId/set", _auth.default, async (req, res) => {
  const courseUnitId = req.params.courseUnitId;

  try {
    const courseUnit = await _CourseUnit.default.findOne({
      _id: courseUnitId
    });

    if (!courseUnit) {
      return res.status(400).json({
        errors: [{
          msg: "courseunit not found"
        }]
      });
    }

    if (courseUnit.isStreamReady === false) {
      return res.status(400).json({
        errors: [{
          msg: "course unit still processing..."
        }]
      });
    }

    courseUnit.is_preview_able = true;
    await courseUnit.save();
    res.json(addDifferentVideoFormatsToUnitsObject(courseUnit.toObject()));
  } catch (error) {
    res.status(500).json(error);
  }
}); // route to unset courseunit ID

router.put("/preview/:courseUnitId/unset", _auth.default, async (req, res) => {
  const courseUnitId = req.params.courseUnitId;

  try {
    const courseUnit = await _CourseUnit.default.findOne({
      _id: courseUnitId
    });

    if (!courseUnit) {
      return res.status(400).json({
        errors: [{
          msg: "courseunit not found"
        }]
      });
    }

    courseUnit.is_preview_able = false;
    await courseUnit.save();
    res.json(addDifferentVideoFormatsToUnitsObject(courseUnit.toObject()));
  } catch (error) {
    res.status(500).json(error);
  }
}); // route to get all previewable course unit by courseID

router.get("/preview/:courseId", async (req, res) => {
  const courseId = req.params.courseId;

  try {
    const courseUnits = await _CourseUnit.default.find({
      is_preview_able: true,
      course: courseId
    });
    res.json(courseUnits);
  } catch (error) {
    res.status(500).json(error);
  }
});
const attachmentUplaod = (0, _multer.default)({
  storage: storageDest
}); // route to add courseunit attachment

router.put("/attachment/:courseUnitId", _auth.default, _validateUserPayment.default, attachmentUplaod.single("attachment"), async (req, res) => {
  const courseUnitId = req.params.courseUnitId;

  try {
    let courseUnit = await _CourseUnit.default.findOne({
      _id: courseUnitId
    });

    if (!courseUnit) {
      return res.status(400).json({
        errors: [{
          msg: "course unit not found"
        }]
      });
    }

    const course = await _Course.default.findOne({
      _id: courseUnit.course
    });

    if (!course) {
      return res.status(400).json({
        errors: [{
          msg: "course not valid"
        }]
      });
    }

    if (!req.file) {
      return res.status(400).json({
        errors: [{
          msg: "invalid file type"
        }]
      });
    }

    const fileType = `.${req.file.originalname.split(".")[req.file.originalname.split(".").length - 1]}`;
    const attachmentToBeUploaded = (0, _dataUri.default)(`${fileType}`, req.file.buffer).content;
    let uploadResponse = await _cloudinary.default.v2.uploader.upload(attachmentToBeUploaded, {
      resource_type: "auto",
      folder: `tuturly/course/${course.title}/attachment`,
      flags: "attachment"
    });
    const attachment = {
      url: uploadResponse.secure_url,
      attachmentId: uploadResponse.public_id,
      filename: req.file.originalname
    };
    courseUnit.attachment.push(attachment);
    await courseUnit.save();
    res.json(addDifferentVideoFormatsToUnitsObject(courseUnit.toObject()));
  } catch (error) {
    console.error(error);

    if (error.message === "Request Timeout") {
      return res.status(500).json({
        msg: "resource cannot be uploaded at the moment"
      });
    }

    res.status(500).send("server");
  }
}); // route to delete attachment

router.put("/attachment/remove/:courseUnitId/:attachmentId", _auth.default, _validateUserPayment.default, async (req, res) => {
  const courseUnitId = req.params.courseUnitId;
  const attachmentId = req.params.attachmentId;

  try {
    let courseUnit = await _CourseUnit.default.findOne({
      _id: courseUnitId
    });

    if (!courseUnit) {
      return res.status(400).json({
        errors: [{
          msg: "course unit not found"
        }]
      });
    }

    const attachmentToBeDeleted = courseUnit.attachment.find(attachment => attachment._id == attachmentId);

    if (attachmentToBeDeleted) {
      // remove attachment from cloud server
      await _cloudinary.default.v2.uploader.destroy(attachmentToBeDeleted.attachmentId, {
        resource_type: "raw"
      });
    }

    courseUnit.attachment = courseUnit.attachment.filter(attachment => attachment._id != attachmentId);
    await courseUnit.save();
    res.json(addDifferentVideoFormatsToUnitsObject(courseUnit.toObject()));
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
}); // route to update courseUnit video url

router.put("/video/:courseId/:courseUnitId", _auth.default, _validateUserPayment.default, [(0, _expressValidator.body)("videourl", "video url cannot be empty").not().isEmpty(), (0, _expressValidator.body)("videopublicid", "video publicId cannot be empty").not().isEmpty(), (0, _expressValidator.body)("filesize", "video file size cannot be empty").not().isEmpty(), (0, _expressValidator.body)("duration", "video duration cannot be empty").not().isEmpty()], async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const courseId = req.params.courseId;
  const courseUnitId = req.params.courseUnitId;

  try {
    const course = await _Course.default.findOne({
      _id: courseId
    });

    if (!course) {
      return res.status(400).json({
        errors: [{
          msg: "course not valid"
        }]
      });
    }

    const courseUnit = await _CourseUnit.default.findOne({
      _id: courseUnitId
    });

    if (!courseUnit) {
      return res.status(400).json({
        errors: [{
          msg: "course unit not found"
        }]
      });
    }

    const {
      videourl,
      videopublicid,
      filesize,
      duration
    } = req.body;
    const publicVideoIdOfUpdatedVideo = courseUnit.videopublicid;
    const videoFilePathExtension = `.${videourl.split(".")[videourl.split(".").length - 1]}`;
    courseUnit.videourl = videourl;
    courseUnit.videopublicid = videopublicid;
    courseUnit.videothumbnail = videourl.replace(videoFilePathExtension, ".png");
    courseUnit.file_size = filesize;
    courseUnit.duration = duration;
    await _cloudinary.default.v2.uploader.destroy(publicVideoIdOfUpdatedVideo, {
      resource_type: "video"
    });
    await courseUnit.save();
    res.json(addDifferentVideoFormatsToUnitsObject(courseUnit.toObject()));
  } catch (error) {
    console.error(error);
    res.status(500).send("server");
  }
}); // private route to get courseUnits By courseChaptedId ID

router.get("/unit/:coursechapterId", _auth.default, async (req, res) => {
  const courseChaptedId = req.params.coursechapterId;

  try {
    const courseunits = await _CourseUnit.default.find({
      coursechapter: courseChaptedId
    }).select({
      videothumbnail: 1,
      name: 1,
      position: 1
    }).sort("position");
    res.json(courseunits);
  } catch (error) {
    console.error(error);
    res.status(500).send("server");
  }
}); // private route to delete course unit

router.delete("/:courseUintId/:courseId", _auth.default, _validateUserPayment.default, async (req, res) => {
  const courseUnitId = req.params.courseUintId;
  const courseId = req.params.courseId;

  try {
    const courseUnit = await _CourseUnit.default.findOne({
      _id: courseUnitId
    });

    if (!courseUnit) {
      return res.status(400).json({
        errors: [{
          msg: "courseunit not found"
        }]
      });
    }

    if (courseUnit.isPdf === true) {
      // delete document from cloudinary
      await _cloudinary.default.v2.uploader.destroy(courseUnit.pdfPublicId, {
        resource_type: "raw"
      });
    } else {
      if (courseUnit.isCloudflareVideoSource === true) {
        // implement cloudflare delete functionality here
        // and set video stream state back to false/ or video not ready to stream
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN}`
          }
        };
        await _axios.default.delete(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/${courseUnit.videopublicid}`, config);
      } else {
        // delete course unit video from cloudinary
        await _cloudinary.default.v2.uploader.destroy(courseUnit.videopublicid, {
          resource_type: "video"
        });
      }
    } // delete course unit attachments


    courseUnit.attachment.forEach(async attachment => {
      await _cloudinary.default.v2.uploader.destroy(attachment.attachmentPublicId, {
        resource_type: "raw"
      });
    }); // delete course unit notes

    await _Note.default.deleteMany({
      courseunit: _mongoose.default.Types.ObjectId(courseUnitId)
    }); // delete course unit replies

    await _Reply.default.deleteMany({
      courseunit: _mongoose.default.Types.ObjectId(courseUnitId)
    }); // delete course unit comments

    await _Comment.default.deleteMany({
      courseunit: _mongoose.default.Types.ObjectId(courseUnitId)
    }); // delete the actual course Unit

    await courseUnit.remove(); // query to get all the course modules including module with the
    // new deleted course unit

    const modulesWithUpdatedCourseUnit = await _CourseChapter.default.find({
      course: courseId
    }).populate("courseunit");
    res.json(modulesWithUpdatedCourseUnit);
  } catch (error) {
    console.error(error);
    res.status(500).send("server");
  }
}); // route to reorder the position in the backend

router.put("/:moduleId/reorder", [(0, _expressValidator.body)("list", "list cannot be empty").not().isEmpty()], _auth.default, _validateUserPayment.default, async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  try {
    const validModule = await _CourseChapter.default.findOne({
      _id: req.params.moduleId
    });

    if (!validModule) {
      return res.status(400).json({
        errors: [{
          msg: "module not found"
        }]
      });
    }

    const {
      list
    } = req.body;
    list.forEach(async unitItem => {
      const unit = await _CourseUnit.default.findOne({
        _id: unitItem._id
      });
      unit.position = unitItem.index;
      await unit.save();
    });
    res.send();
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
});
router.get("/uploadsize/:authorId", _auth.default, async (req, res) => {
  const authorId = req.params.authorId;

  try {
    const uploadSizeSum = await _CourseUnit.default.aggregate([{
      $match: {
        author: _mongoose.default.Types.ObjectId(authorId)
      }
    }, {
      $group: {
        _id: null,
        uploadtotal: {
          $sum: "$file_size"
        }
      }
    }]);
    res.json(uploadSizeSum);
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
});
const videoTestUpload = (0, _multer.default)({
  storageDest
}).single("video");
router.put("/testing/video/upload/transformation", videoTestUpload, async (req, res) => {
  try {
    const fileType = `.${req.file.originalname.split(".")[req.file.originalname.split(".").length - 1]}`;
    const attachmentToBeUploaded = (0, _dataUri.default)(`${fileType}`, req.file.buffer).content;
  } catch (error) {
    console.log(error);
    res.status(500).send("server error");
  }
});
var _default = router;
exports.default = _default;