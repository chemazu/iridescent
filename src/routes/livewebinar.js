import { v4 as uuidv4 } from "uuid";
import auth from "../middleware/auth";
import studentAuth from "../middleware/studentAuth";
import cloudinary from "cloudinary";
import multer, { memoryStorage } from "multer";
import { Router } from "express";
import LiveWebinar from "../models/Livewebinar";
import School from "../models/School";

import { body, validationResult } from "express-validator";
import User from "../models/User";
import Student from "../models/Student";
import PaymentPlans from "../models/PaymentPlans";
import dataUri from "../utilities/dataUri";
import StudentWebinar from "../models/StudentWebinar";

const router = Router();
const storageDest = memoryStorage();
const createCourseThumbnailPhoto = multer({
  storage: storageDest,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|PNG|JPG|JPEG)$/)) {
      return cb(new Error("Please Upload another Image"));
    }
    cb(undefined, true);
  },
});

// const uploadFileToCloudinary = (file, options) => {
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
router.post(
  "/",
  [
    auth,
    createCourseThumbnailPhoto.single("file"),
    body("title", "title is required").not().isEmpty(),
    body("description", "description is required").not().isEmpty(),
    body("isRecurring", "isRecurring is required").not().isEmpty(),
    body("fee", "fee is required").not().isEmpty(),
    body("category", "category is required").not().isEmpty(),
    body("startTime", "startTime is required").not().isEmpty(),
    body("currency", "currency is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
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
      webinarReps,
    } = req.body;
    const streamKey = uuidv4();
    const streamUrl = `${streamKey}`;
    const creator = req.user.id;
    const creatorSchool = await School.findOne({ createdBy: req.user.id });
    const school = creatorSchool._id;
    const fileType = `.${
      req.file.originalname.split(".")[
        req.file.originalname.split(".").length - 1
      ]
    }`;
    const imageToBeUploaded = dataUri(`${fileType}`, req.file.buffer).content;
    const uploadResponse = await cloudinary.v2.uploader.upload(
      imageToBeUploaded,
      {
        folder: `tuturly/webinar/${title}`,
      }
    );

    const newStream = new LiveWebinar({
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
    });

    // let options = {
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
        uniqueLink: savedStream.uniqueLink,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// confirm a live stream

router.get("/watch/:streamKey", async (req, res) => {
  const { streamKey } = req.params;

  try {
    const livestream = await LiveWebinar.findOne({ streamKey })
      .populate("creator")
      .populate("school");
    let payment = await PaymentPlans.findOne(livestream.creator.selectedplan);
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
        timeLeft: livestream.timeleft,
      });
    }
    // check if they are validate for the livestream registered to the course or check a password
    // res.json({ error: "Stream not found" });
  } catch (error) {
    // res.json({ error: "Server error" });
    console.log(error);
  }
});

// get live streams
router.get("/streams", auth, async (req, res) => {
  // the query only returns the webinars whose startTime is greater than or equal to the current date/time
  let streams = await LiveWebinar.find({
    creator: req.user.id,
    // startTime: { $gte: new Date() },
  }).sort({ startTime: 1 });

  if (!streams) {
    return res.json({ error: "Stream not found" });
  }
  res.json({ streams });
});

router.get("/schoolstreams/:schoolName", async (req, res) => {
  let { schoolName } = req.params;
  let school = await School.findOne({ name: schoolName });

  let streams = await LiveWebinar.find({
    creator: school.createdBy,
    // startTime: { $gte: new Date() },
  }).sort({ startTime: 1 });

  if (!streams) {
    return res.json({ error: "Stream not found" });
  }
  res.json({ streams });
});

router.get("/streamdetails/:streamId", async (req, res) => {
  const { streamId } = req.params;
  try {
    const livestream = await LiveWebinar.findOne({ _id: streamId });
    if (livestream) {
      res.json(livestream);
    }
  } catch (error) {
    // res.json({ error: "Server error" });
    console.log(error);
  }
});

// get user details
router.get("/studentdetails", studentAuth, async (req, res) => {
  let user = await Student.findOne({ _id: req.student.id });

  res.json({ username: user.username });
});

// Start the server

// router.get("/purge", async () => {
// await LiveWebinar.deleteMany({});
//   await StudentWebinar.deleteMany({});
//   console.log("All documents deleted successfully.");
// });
export default router;
