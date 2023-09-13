import express from "express";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import { body, validationResult } from "express-validator";
import multer, { memoryStorage } from "multer";
import Course from "../models/Course";
import CourseChapter from "../models/CourseChapter";
import CourseUnit from "../models/CourseUnit";
import Comment from "../models/Comment";
import Reply from "../models/Reply";
import Note from "../models/Note";
import auth from "../middleware/auth";
import validateUserPayment from "../middleware/validateUserPayment";
import validateUserUploadAgainstAvailableUsageQuota from "../middleware/validateUserUploadAgainstAvailableUsageQuota";
import dataUri from "../utilities/dataUri";
import axios from "axios";

const router = express.Router();
const storageDest = memoryStorage();

// upload pdf file
const multerUploads = multer({ storageDest }).single("document");

// upload pdf
router.post(
  "/document/:courseId/:moduleId/:filesize",
  auth,
  validateUserPayment,
  validateUserUploadAgainstAvailableUsageQuota,
  multerUploads,
  [body("name", "course unit name is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    if (!req.file) {
      return res.status(400).json({
        errors: [{ msg: "please input a file" }],
      });
    }

    const fileType = `.${
      req.file.originalname.split(".")[
        req.file.originalname.split(".").length - 1
      ]
    }`;

    if (!fileType == `.PDF`) {
      return res.status(400).json({
        errors: [{ msg: "only pdf files allowed" }],
      });
    }

    const attachmentToBeUploaded = dataUri(
      `${fileType}`,
      req.file.buffer
    ).content;

    const courseId = req.params.courseId;
    const moduleId = req.params.moduleId;

    try {
      // check and validate course from course id that is valid
      const course = await Course.findOne({
        _id: courseId,
      });

      if (!course) {
        return res.status(400).json({
          errors: [{ msg: "course not valid" }],
        });
      }

      let uploadResponse = await cloudinary.v2.uploader.upload(
        attachmentToBeUploaded,
        {
          resource_type: "auto",
          folder: `tuturly/course/${course.title}/document`,
          flags: "attachment",
        }
      );
      let cloudToDatabase = {
        name: req.body.name,
        pdfName: req.file.originalname,
        pdfUrl: uploadResponse.secure_url,
        pdfFileSize: uploadResponse.bytes,
        pdfPublicId: uploadResponse.public_id,
        isPdf: true,
      };
      const courseModule = await CourseChapter.findOne({
        _id: moduleId,
      });

      if (!courseModule) {
        return res.status(400).json({
          errors: [{ msg: "module not valid" }],
        });
      }

      let position;

      const courseUnitPerModuleCount = await CourseUnit.countDocuments({
        coursechapter: moduleId,
      });

      if (courseUnitPerModuleCount === 0) {
        position = 0;
      } else {
        const courseUnitByModuleId = await CourseUnit.find({
          coursechapter: moduleId,
        }).sort("position");
        const positionOfTheLastItem =
          courseUnitByModuleId[courseUnitByModuleId.length - 1];
        position = positionOfTheLastItem.position + 1;
      }

      const courseUnitObj = new CourseUnit({
        ...cloudToDatabase,
        position: position,
        course: courseId,
        coursechapter: moduleId,
      });

      await courseUnitObj.save();

      // update courseChapter/module to save the id of the newly created
      // course unit
      courseModule.courseunit.push(courseUnitObj._id);
      await courseModule.save();

      // query to get all the course modules including module with the
      // new added course unit
      const modulesWithUpdatedCourseUnit = await CourseChapter.find({
        course: courseId,
      }).populate("courseunit");
      res.json(modulesWithUpdatedCourseUnit);
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  }
);

// const videoUpload = upload.single('videofile')

router.post(
  "/:courseId/:moduleId",
  auth,
  validateUserPayment,

  [
    body("name", "name cannot be empty").not().isEmpty(),
    body("videourl", "video url cannot be empty").not().isEmpty(),
    body("videopublicid", "video publicid cannot be empty").not().isEmpty(),
    body("filesize", "video filesize cannot be empty").not().isEmpty(),
    body("duration", "video duration cannot be empty").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
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
      streamableVideoUrl,
    } = req.body;

    try {
      // check and validate course from course id that is valid
      const course = await Course.findOne({
        _id: courseId,
      });

      if (!course) {
        return res.status(400).json({
          errors: [{ msg: "course not valid" }],
        });
      }

      const courseModule = await CourseChapter.findOne({
        _id: moduleId,
      });

      if (!courseModule) {
        return res.status(400).json({
          errors: [{ msg: "module not valid" }],
        });
      }

      let position;

      const courseUnitPerModuleCount = await CourseUnit.countDocuments({
        coursechapter: moduleId,
      });

      if (courseUnitPerModuleCount === 0) {
        position = 0;
      } else {
        const courseUnitByModuleId = await CourseUnit.find({
          coursechapter: moduleId,
        }).sort("position");
        const positionOfTheLastItem =
          courseUnitByModuleId[courseUnitByModuleId.length - 1];
        position = positionOfTheLastItem.position + 1;
      }

      const videoFilePathExtension = `.${
        videourl.split(".")[videourl.split(".").length - 1]
      }`;

      const courseUnitObj = new CourseUnit({
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
        isPdf: false,
      });

      await courseUnitObj.save();

      // update courseChapter/module to save the id of the newly created
      // course unit
      courseModule.courseunit.push(courseUnitObj._id);
      await courseModule.save();

      // query to get all the course modules including module with the
      // new added course unit
      const modulesWithUpdatedCourseUnit = await CourseChapter.find({
        course: courseId,
      }).populate("courseunit");
      res.json(modulesWithUpdatedCourseUnit);
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  }
);

router.get(
  "/upload/signature/:courseId/:filesize",
  auth,
  validateUserPayment,
  validateUserUploadAgainstAvailableUsageQuota,
  async (req, res) => {
    const courseId = req.params.courseId;
    const videoFileSize = req.params.filesize;

    if (videoFileSize > 256) {
      // conditions ensures the file size is always below 1gb
      return res.status(400).json({
        errors: [
          {
            msg: "Video size exceeds maximum allowed for video upload",
          },
        ],
      });
    }

    try {
      const course = await Course.findOne({
        _id: courseId,
      });

      if (!course) {
        return res.status(400).json({
          errors: [{ msg: "course not valid" }],
        });
      }

      const timestamp = Math.round(new Date().getTime() / 1000);
      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp: timestamp,
          folder: `tuturly/course/${course.title}/video`,
          // eager: "sp_full_hd/m3u8",
        },
        process.env.CLOUDINARY_API_SECRET
      );

      res.json({
        signature: signature,
        timestamp: timestamp,
        cloudname: process.env.CLOUDINARY_CLOUD_NAME,
        apikey: process.env.CLOUDINARY_API_KEY,
        // eager: "sp_full_hd/m3u8",
        folder: `tuturly/course/${course.title}/video`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  }
);

router.get(
  "/upload/url/cloudflare/:courseId/:filesize",
  auth,
  validateUserPayment,
  validateUserUploadAgainstAvailableUsageQuota,
  async (req, res) => {
    const courseId = req.params.courseId;
    const videoFileSize = req.params.filesize;

    if (videoFileSize > 200) {
      // conditions ensures the file size is always below 256mb
      return res.status(400).json({
        errors: [
          {
            msg: "Video size exceeds maximum allowed for video upload",
          },
        ],
      });
    }

    try {
      const course = await Course.findOne({
        _id: courseId,
      });

      if (!course) {
        return res.status(400).json({
          errors: [{ msg: "course not valid" }],
        });
      }
      const config = {
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN}`,
        },
      };
      const cloudflarePostUrl = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`;
      const body = JSON.stringify({
        maxDurationSeconds: 3600,
        creator: req.user.id,
        allowedOrigins: [
          "localhost:3000",
          "*.localhost:3000",
          "tuturly.com",
          "*.tuturly.com",
        ],
      });
      const cloudflareRes = await axios.post(cloudflarePostUrl, body, config);
      res.json(cloudflareRes.data);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
);

// route to save cloudflare video data and courseUnit to DB
router.post(
  "/upload/save/cloudflare/:courseId/:moduleId",
  [
    body("name", "video title required").not().isEmpty(),
    body("videoId", "video Id required").not().isEmpty(),
  ],
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const courseId = req.params.courseId;
    const moduleId = req.params.moduleId;
    const { name, videoId } = req.body;

    let position;

    try {
      const courseModule = await CourseChapter.findOne({
        _id: moduleId,
      });

      if (!courseModule) {
        return res.status(400).json({
          errors: [{ msg: "module not valid" }],
        });
      }

      const courseUnitPerModuleCount = await CourseUnit.countDocuments({
        coursechapter: moduleId,
      });

      if (courseUnitPerModuleCount === 0) {
        position = 0;
      } else {
        const courseUnitByModuleId = await CourseUnit.find({
          coursechapter: moduleId,
        }).sort("position");
        const positionOfTheLastItem =
          courseUnitByModuleId[courseUnitByModuleId.length - 1];
        position = positionOfTheLastItem.position + 1;
      }

      const courseUnitObj = new CourseUnit({
        name,
        videopublicid: videoId,
        isCloudflareVideoSource: true,
        course: courseId,
        coursechapter: moduleId,
        author: req.user.id,
        position: position,
        isStreamReady: false,
        isPdf: false,
      });
      await courseUnitObj.save();

      // update courseChapter/module to save the id of the newly created
      // course unit
      courseModule.courseunit.push(courseUnitObj._id);
      await courseModule.save();

      // query to get all the course modules including module with the
      // new added course unit
      const modulesWithUpdatedCourseUnit = await CourseChapter.find({
        course: courseId,
      }).populate("courseunit");
      res.json(modulesWithUpdatedCourseUnit);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
);

// route to update course units after video update replace in cloudflare
router.put(
  "/upload/update/cloudflare/:courseId/:courseunitId",
  auth,
  validateUserPayment,
  [body("videoId", "video Id is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const courseId = req.params.courseId;
    const courseUnitId = req.params.courseunitId;

    try {
      const course = await Course.findOne({
        _id: courseId,
      });

      if (!course) {
        return res.status(400).json({
          errors: [{ msg: "course not valid" }],
        });
      }

      const courseUnit = await CourseUnit.findOne({
        _id: courseUnitId,
      });
      if (!courseUnit) {
        return res.status(400).json({
          errors: [{ msg: "course unit not found" }],
        });
      }

      const { videoId } = req.body;
      const publicVideoIdOfUpdatedVideo = courseUnit.videopublicid;

      if (courseUnit.isCloudflareVideoSource === true) {
        // implement cloudflare delete functionality here
        // and set video stream state back to false/ or video not ready to stream
        courseUnit.isStreamReady = false;
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN}`,
          },
        };
        await axios.delete(
          `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/${publicVideoIdOfUpdatedVideo}`,
          config
        );
      } else {
        courseUnit.isCloudflareVideoSource = true;
        await cloudinary.v2.uploader.destroy(publicVideoIdOfUpdatedVideo, {
          resource_type: "video",
        });
      }

      courseUnit.videopublicid = videoId;
      await courseUnit.save();
      res.json(addDifferentVideoFormatsToUnitsObject(courseUnit.toObject()));
    } catch (error) {
      console.error(error);
      res.status(500).send("server");
    }
  }
);

const addDifferentVideoFormatsToUnitsObject = (courseUnit) => {
  if (courseUnit.isCloudflareVideoSource === true) return courseUnit;
  const videourl = courseUnit.videourl;
  const webmvideourl = videourl.replace(".mp4", ".webm");
  const ogvvideourl = videourl.replace(".mp4", ".ogv");
  return {
    ...courseUnit,
    webmvideourl,
    ogvvideourl,
  };
};

router.get("/:courseUnitId", auth, async (req, res) => {
  const courseUnitId = req.params.courseUnitId;
  try {
    const courseUnit = await CourseUnit.findOne({
      _id: courseUnitId,
    });
    if (!courseUnit) {
      return res.status(400).json({
        errors: [{ msg: "course unit not found" }],
      });
    }
    res.json(addDifferentVideoFormatsToUnitsObject(courseUnit.toObject()));
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

// update course unit name
router.put(
  "/:courseUnitId",
  auth,
  validateUserPayment,
  [body("name", "unit name cannot be empty").not().isEmpty()],
  async (req, res) => {
    const courseUnitId = req.params.courseUnitId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const { name } = req.body;
    try {
      const courseUnit = await CourseUnit.findOne({
        _id: courseUnitId,
      });
      if (!courseUnit) {
        return res.status(400).json({
          errors: [{ msg: "course unit not found" }],
        });
      }
      courseUnit.name = name;
      await courseUnit.save();
      res.json(addDifferentVideoFormatsToUnitsObject(courseUnit.toObject()));
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  }
);

// route to set courseunit ID
router.put("/preview/:courseUnitId/set", auth, async (req, res) => {
  const courseUnitId = req.params.courseUnitId;
  try {
    const courseUnit = await CourseUnit.findOne({
      _id: courseUnitId,
    });
    if (!courseUnit) {
      return res.status(400).json({
        errors: [{ msg: "courseunit not found" }],
      });
    }
    if (courseUnit.isStreamReady === false) {
      return res.status(400).json({
        errors: [{ msg: "course unit still processing..." }],
      });
    }
    courseUnit.is_preview_able = true;
    await courseUnit.save();
    res.json(addDifferentVideoFormatsToUnitsObject(courseUnit.toObject()));
  } catch (error) {
    res.status(500).json(error);
  }
});

// route to unset courseunit ID
router.put("/preview/:courseUnitId/unset", auth, async (req, res) => {
  const courseUnitId = req.params.courseUnitId;
  try {
    const courseUnit = await CourseUnit.findOne({
      _id: courseUnitId,
    });
    if (!courseUnit) {
      return res.status(400).json({
        errors: [{ msg: "courseunit not found" }],
      });
    }
    courseUnit.is_preview_able = false;
    await courseUnit.save();
    res.json(addDifferentVideoFormatsToUnitsObject(courseUnit.toObject()));
  } catch (error) {
    res.status(500).json(error);
  }
});

// route to get all previewable course unit by courseID
router.get("/preview/:courseId", async (req, res) => {
  const courseId = req.params.courseId;
  try {
    const courseUnits = await CourseUnit.find({
      is_preview_able: true,
      course: courseId,
    });
    res.json(courseUnits);
  } catch (error) {
    res.status(500).json(error);
  }
});

const attachmentUplaod = multer({
  storage: storageDest,
});

// route to add courseunit attachment
router.put(
  "/attachment/:courseUnitId",
  auth,
  validateUserPayment,
  attachmentUplaod.single("attachment"),
  async (req, res) => {
    const courseUnitId = req.params.courseUnitId;
    try {
      let courseUnit = await CourseUnit.findOne({
        _id: courseUnitId,
      });

      if (!courseUnit) {
        return res.status(400).json({
          errors: [{ msg: "course unit not found" }],
        });
      }

      const course = await Course.findOne({
        _id: courseUnit.course,
      });

      if (!course) {
        return res.status(400).json({
          errors: [{ msg: "course not valid" }],
        });
      }

      if (!req.file) {
        return res.status(400).json({
          errors: [{ msg: "invalid file type" }],
        });
      }

      const fileType = `.${
        req.file.originalname.split(".")[
          req.file.originalname.split(".").length - 1
        ]
      }`;

      const attachmentToBeUploaded = dataUri(
        `${fileType}`,
        req.file.buffer
      ).content;

      let uploadResponse = await cloudinary.v2.uploader.upload(
        attachmentToBeUploaded,
        {
          resource_type: "auto",
          folder: `tuturly/course/${course.title}/attachment`,
          flags: "attachment",
        }
      );

      const attachment = {
        url: uploadResponse.secure_url,
        attachmentId: uploadResponse.public_id,
        filename: req.file.originalname,
      };

      courseUnit.attachment.push(attachment);
      await courseUnit.save();
      res.json(addDifferentVideoFormatsToUnitsObject(courseUnit.toObject()));
    } catch (error) {
      console.error(error);
      if (error.message === "Request Timeout") {
        return res.status(500).json({
          msg: "resource cannot be uploaded at the moment",
        });
      }
      res.status(500).send("server");
    }
  }
);

// route to delete attachment
router.put(
  "/attachment/remove/:courseUnitId/:attachmentId",
  auth,
  validateUserPayment,
  async (req, res) => {
    const courseUnitId = req.params.courseUnitId;
    const attachmentId = req.params.attachmentId;

    try {
      let courseUnit = await CourseUnit.findOne({
        _id: courseUnitId,
      });
      if (!courseUnit) {
        return res.status(400).json({
          errors: [{ msg: "course unit not found" }],
        });
      }

      const attachmentToBeDeleted = courseUnit.attachment.find(
        (attachment) => attachment._id == attachmentId
      );
      if (attachmentToBeDeleted) {
        // remove attachment from cloud server
        await cloudinary.v2.uploader.destroy(
          attachmentToBeDeleted.attachmentId,
          {
            resource_type: "raw",
          }
        );
      }

      courseUnit.attachment = courseUnit.attachment.filter(
        (attachment) => attachment._id != attachmentId
      );
      await courseUnit.save();
      res.json(addDifferentVideoFormatsToUnitsObject(courseUnit.toObject()));
    } catch (error) {
      console.error(error);
      res.status(500).send("server error");
    }
  }
);

// route to update courseUnit video url
router.put(
  "/video/:courseId/:courseUnitId",
  auth,
  validateUserPayment,
  [
    body("videourl", "video url cannot be empty").not().isEmpty(),
    body("videopublicid", "video publicId cannot be empty").not().isEmpty(),
    body("filesize", "video file size cannot be empty").not().isEmpty(),
    body("duration", "video duration cannot be empty").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const courseId = req.params.courseId;
    const courseUnitId = req.params.courseUnitId;

    try {
      const course = await Course.findOne({
        _id: courseId,
      });

      if (!course) {
        return res.status(400).json({
          errors: [{ msg: "course not valid" }],
        });
      }

      const courseUnit = await CourseUnit.findOne({
        _id: courseUnitId,
      });
      if (!courseUnit) {
        return res.status(400).json({
          errors: [{ msg: "course unit not found" }],
        });
      }

      const { videourl, videopublicid, filesize, duration } = req.body;
      const publicVideoIdOfUpdatedVideo = courseUnit.videopublicid;

      const videoFilePathExtension = `.${
        videourl.split(".")[videourl.split(".").length - 1]
      }`;

      courseUnit.videourl = videourl;
      courseUnit.videopublicid = videopublicid;
      courseUnit.videothumbnail = videourl.replace(
        videoFilePathExtension,
        ".png"
      );
      courseUnit.file_size = filesize;
      courseUnit.duration = duration;

      await cloudinary.v2.uploader.destroy(publicVideoIdOfUpdatedVideo, {
        resource_type: "video",
      });

      await courseUnit.save();
      res.json(addDifferentVideoFormatsToUnitsObject(courseUnit.toObject()));
    } catch (error) {
      console.error(error);
      res.status(500).send("server");
    }
  }
);

// private route to get courseUnits By courseChaptedId ID
router.get("/unit/:coursechapterId", auth, async (req, res) => {
  const courseChaptedId = req.params.coursechapterId;

  try {
    const courseunits = await CourseUnit.find({
      coursechapter: courseChaptedId,
    })
      .select({
        videothumbnail: 1,
        name: 1,
        position: 1,
      })
      .sort("position");

    res.json(courseunits);
  } catch (error) {
    console.error(error);
    res.status(500).send("server");
  }
});

// private route to delete course unit
router.delete(
  "/:courseUintId/:courseId",
  auth,
  validateUserPayment,
  async (req, res) => {
    const courseUnitId = req.params.courseUintId;
    const courseId = req.params.courseId;

    try {
      const courseUnit = await CourseUnit.findOne({
        _id: courseUnitId,
      });
      if (!courseUnit) {
        return res.status(400).json({
          errors: [{ msg: "courseunit not found" }],
        });
      }

      if (courseUnit.isPdf === true) {
        // delete document from cloudinary
        await cloudinary.v2.uploader.destroy(courseUnit.pdfPublicId, {
          resource_type: "raw",
        });
      } else {
        if (courseUnit.isCloudflareVideoSource === true) {
          // implement cloudflare delete functionality here
          // and set video stream state back to false/ or video not ready to stream
          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN}`,
            },
          };
          await axios.delete(
            `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/${courseUnit.videopublicid}`,
            config
          );
        } else {
          // delete course unit video from cloudinary
          await cloudinary.v2.uploader.destroy(courseUnit.videopublicid, {
            resource_type: "video",
          });
        }
      }

      // delete course unit attachments
      courseUnit.attachment.forEach(async (attachment) => {
        await cloudinary.v2.uploader.destroy(attachment.attachmentPublicId, {
          resource_type: "raw",
        });
      });

      // delete course unit notes
      await Note.deleteMany({
        courseunit: mongoose.Types.ObjectId(courseUnitId),
      });

      // delete course unit replies
      await Reply.deleteMany({
        courseunit: mongoose.Types.ObjectId(courseUnitId),
      });

      // delete course unit comments
      await Comment.deleteMany({
        courseunit: mongoose.Types.ObjectId(courseUnitId),
      });

      // delete the actual course Unit
      await courseUnit.remove();

      // query to get all the course modules including module with the
      // new deleted course unit
      const modulesWithUpdatedCourseUnit = await CourseChapter.find({
        course: courseId,
      }).populate("courseunit");
      res.json(modulesWithUpdatedCourseUnit);
    } catch (error) {
      console.error(error);
      res.status(500).send("server");
    }
  }
);

// route to reorder the position in the backend
router.put(
  "/:moduleId/reorder",
  [body("list", "list cannot be empty").not().isEmpty()],
  auth,
  validateUserPayment,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      const validModule = await CourseChapter.findOne({
        _id: req.params.moduleId,
      });
      if (!validModule) {
        return res.status(400).json({
          errors: [{ msg: "module not found" }],
        });
      }

      const { list } = req.body;
      list.forEach(async (unitItem) => {
        const unit = await CourseUnit.findOne({
          _id: unitItem._id,
        });
        unit.position = unitItem.index;
        await unit.save();
      });
      res.send();
    } catch (error) {
      res.status(500).send("server error");
      console.error(error);
    }
  }
);

router.get("/uploadsize/:authorId", auth, async (req, res) => {
  const authorId = req.params.authorId;
  try {
    const uploadSizeSum = await CourseUnit.aggregate([
      {
        $match: {
          author: mongoose.Types.ObjectId(authorId),
        },
      },
      {
        $group: {
          _id: null,
          uploadtotal: {
            $sum: "$file_size",
          },
        },
      },
    ]);
    res.json(uploadSizeSum);
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
});

const videoTestUpload = multer({ storageDest }).single("video");
router.put(
  "/testing/video/upload/transformation",
  videoTestUpload,
  async (req, res) => {
    try {
      const fileType = `.${
        req.file.originalname.split(".")[
          req.file.originalname.split(".").length - 1
        ]
      }`;

      const attachmentToBeUploaded = dataUri(
        `${fileType}`,
        req.file.buffer
      ).content;
    } catch (error) {
      console.log(error);
      res.status(500).send("server error");
    }
  }
);

export default router;
