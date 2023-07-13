import { v4 as uuidv4 } from "uuid";
import auth from "../middleware/auth";
import studentAuth from "../middleware/studentAuth";

import cloudinary from "cloudinary";
import multer, { memoryStorage } from "multer";
import { Router } from "express";
import LiveWebinar from "../models/Livewebinar";
import School from "../models/School";
import Course from "../models/Course";

import { body, validationResult } from "express-validator";
import User from "../models/User";
import Student from "../models/Student";
import PaymentPlans from "../models/PaymentPlans";
import dataUri from "../utilities/dataUri";
import StudentWebinar from "../models/StudentWebinar";
import Order from "../models/Order";

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
    // {
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
      timeleft: 2700,
    });

    try {
      const savedStream = await newStream.save();
      res.json({
        message: "Stream created successfully",
        streamKey: savedStream.streamKey,
        uniqueLink: savedStream.uniqueLink,
        id: savedStream._id,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);
router.put(
  "/:id",
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
    console.log("ferer");
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

    try {
      const existingWebinar = await LiveWebinar.findById(req.params.id);
      if (!existingWebinar) {
        return res.status(404).json({ error: "Webinar not found" });
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
        const fileType = `.${
          req.file.originalname.split(".")[
            req.file.originalname.split(".").length - 1
          ]
        }`;
        const imageToBeUploaded = dataUri(`${fileType}`, req.file.buffer);
        const uploadResponse = await cloudinary.v2.uploader.upload(
          imageToBeUploaded.content,
          {
            folder: `tuturly/webinar/${title}`,
          }
        );

        existingWebinar.thumbnail = uploadResponse.secure_url;
        existingWebinar.webinarthumbnailid = uploadResponse.public_id;
      }

      const updatedWebinar = await existingWebinar.save();

      res.json({
        message: "Webinar updated successfully",
        streamKey: updatedWebinar.streamKey,
        uniqueLink: updatedWebinar.uniqueLink,
        id: updatedWebinar._id,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// confirm a live stream

router.get("/stream/:streamKey", auth, async (req, res) => {
  const { streamKey } = req.params;
  let user = req.user.id;

  try {
    const livestream = await LiveWebinar.findOne({ streamKey, creator: user })
      .populate("creator")
      .populate("school");

    if (livestream) {
      const payment = await PaymentPlans.findOne({
        _id: livestream.creator.selectedplan,
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
          id: livestream._id,
        });
      } else {
        res.status(400).json({ error: "Payment plan not found" });
      }
    } else {
      res.status(400).json({ error: "Stream not found" });
    }
  } catch (error) {
    res.status(400).json({ error: "Server error" });
  }
});
router.get("/watch/:streamKey", studentAuth, async (req, res) => {
  const { streamKey } = req.params;
  let studentId = req.student.id;

  try {
    const livestream = await LiveWebinar.findOne({ streamKey })
      .populate("creator")
      .populate("school");

    if (livestream) {
      const payment = await StudentWebinar.findOne({
        student: studentId,
        webinarBought: livestream._id,
        boughtfrom: livestream.school._id,
      });
      const planName = await PaymentPlans.findOne({
        _id: livestream.creator.selectedplan,
      });
      if (payment || livestream.fee === 0) {
        // livestream.streamStarted = timestamp;

        // if (livestream.timeleft === 0) {
        //   livestream.timeleft = 2700;
        // }

        // await livestream.save();

        res.json({
          title: livestream.title,
          streamkey: livestream.streamKey,
          isLive: livestream.isLive,
          firstname: livestream.creator.firstname,
          lastname: livestream.creator.lastname,
          username: livestream.creator.username,
          school: livestream.school.name,
          planname: planName.planname,
          timeLeft: livestream.timeleft,
          avatar: livestream.creator.avatar,

        });
      } else {
        res.status(400).json({ error: "Payment plan not found" });
      }
    } else {
      res.status(400).json({ error: "Stream not found" });
    }
  } catch (error) {
    res.status(400).json({ error: "Server error" });
  }
});

// get live streams
router.get("/streams", auth, async (req, res) => {
  // the query only returns the webinars whose startTime is greater than or equal to the current date/time
  const currentDate = new Date();
  const currentDateOnly = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );

  let streams = await LiveWebinar.find({
    creator: req.user.id,
    startTime: { $gte: currentDateOnly },
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

// get user payment details

router.get("/studentPayment/:schoolname", studentAuth, async (req, res) => {
  try {
    let studentId = req.student.id;
    const schoolname = req.params.schoolname;

    const school = await School.findOne({
      name: schoolname,
    });

    if (!school) {
      return res.status(400).json({
        errors: [
          {
            msg: "school not found",
          },
        ],
      });
    }
    const studentPayment = await StudentWebinar.findOne({
      student: studentId,
      boughtfrom: school._id,
    }).populate("course");
    if (studentPayment) {
      res.json(studentPayment);
    } else {
      return res.status(400).json({
        errors: [
          {
            msg: "payment not found",
          },
        ],
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

// router.get("/purge", async () => {
//   await StudentWebinar.deleteMany({});
//   await LiveWebinar.deleteMany({});
//   console.log("all records deleted");
// });
export default router;
