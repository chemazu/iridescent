import { v4 as uuidv4 } from "uuid";
import auth from "../middleware/auth";
import studentAuth from "../middleware/studentAuth";

import cloudinary from "cloudinary";
import multer, { memoryStorage } from "multer";
import { Router } from "express";
import LiveWebinar from "../models/Livewebinar";
import School from "../models/School";

import { body, validationResult } from "express-validator";

import Student from "../models/Student";
import PaymentPlans from "../models/PaymentPlans";
import dataUri from "../utilities/dataUri";
import StudentWebinar from "../models/StudentWebinar";
import AddResource from "../models/AdditonalResource";

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
    try {
      const streamKey = uuidv4();
      const streamUrl = `${streamKey}`;
      const creator = req.user.id;
      const creatorSchool = await School.findOne({ createdBy: req.user.id });
      const school = creatorSchool._id;
      // the dummy image used as a placeholder for instant webinar  is a png file
      const fileType =
        category === "instant"
          ? `.png`
          : `.${
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
        timeleft: 2700,
      });
      if (fee > 0) {
      }

      const savedStream = await newStream.save();
      res.json({
        message: "Stream created successfully",
        streamKey: savedStream.streamKey,
        fee: savedStream.fee,
        id: savedStream._id,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// increase classroom time

router.put("/addTime", auth, async (req, res) => {
  try {
    const { streamKey, added, transaction_reference, amount, orderType } =
      req.body;

    // Save the transaction details
    const addResource = new AddResource({
      reference: transaction_reference,
      orderfrom: req.user.id,
      amount,
      ordertype: orderType,
      added,
    });
    await addResource.save();

    if (orderType == "time") {
      // Find and update the webinar class end time
      let webinar = await LiveWebinar.findOne({ streamKey });
      if (!webinar) {
        return res.status(404).json({ message: "Classroom not found" });
      }

      const additionalTimeMs = Number(added) * 60 * 1000;
      webinar.classEndTime += additionalTimeMs;
      await webinar.save();

      res.json({ newTime: webinar.classEndTime });
    } else {
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
});
// toggle webinar publish

router.put("/publish/:id", auth, async (req, res) => {
  const { id } = req.params;

  const userId = req.user.id;

  try {
    let webinar = await LiveWebinar.findOne({ _id: id });

    if (!webinar) {
      return res.status(404).json({ error: "Webinar not found" });
    }

    if (webinar.creator.toString() !== userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Remove the webinar
    webinar.isPublished = !webinar.isPublished;
    await webinar.save();

    res.json({ message: "Webinar published successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
router.put("/live/:id", auth, async (req, res) => {
  const { id } = req.params;

  const userId = req.user.id;

  try {
    let webinar = await LiveWebinar.findOne({ _id: id });

    if (!webinar) {
      return res.status(404).json({ error: "Webinar not found" });
    }

    if (webinar.creator.toString() !== userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Remove the webinar
    webinar.isLive = true;
    await webinar.save();

    res.json({ message: "Webinar published successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
// toggle is live
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
        fee,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);
router.get("/classtimer/:streamKey", auth, async (req, res) => {
  const { streamKey } = req.params;
  let user = req.user.id;

  try {
    const livestream = await LiveWebinar.findOne({ streamKey, creator: user })
      .populate("creator")
      .populate("school");
    if (livestream) {
      const timestamp = Date.now();
      const endTime = timestamp + 45 * 60 * 1000;
      livestream.streamStarted = timestamp;

      if (livestream.classEndTime === 0) {
        livestream.classEndTime = endTime;
      }
      await livestream.save();

      res.json({ classEndTime: livestream.classEndTime });
    } else {
      res.status(400).json({ error: "Stream not found" });
    }
  } catch (error) {
    res.status(400).json({ error: "Server error" });
  }
});
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

      if (payment) {
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
          fee: livestream.fee,
          classEndTime: livestream.classEndTime,
          endStatus: livestream.endStatus,
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

router.get("/validate/:streamKey", auth, async (req, res) => {
  const { streamKey } = req.params;
  let user = req.user.id;
  try {
    const livestream = await LiveWebinar.findOne({ streamKey, creator: user })
      .populate("creator")
      .populate("school");

    if (livestream) {
      res.json({
        classEndTime: livestream.classEndTime,
        endStatus: livestream.endStatus,
        firstname: livestream.creator.firstname,
        lastname: livestream.creator.lastname,
        school: livestream.school.name,
        avatar: livestream.creator.avatar,
        title: livestream.title,
      });
    } else {
      res.status(400).json({ error: "Stream not found" });
    }
  } catch (error) {
    res.status(400).json({ error: "Server error" });
  }
});
router.get("/watch/:streamKey", async (req, res) => {
  const { streamKey } = req.params;
  let studentId;
  try {
    const livestream = await LiveWebinar.findOne({ streamKey })
      .populate("creator")
      .populate("school");
    if (livestream) {
      const planName = await PaymentPlans.findOne({
        _id: livestream.creator.selectedplan,
      });
      if (livestream.fee > 0) {
        const token = req.header("x-auth-token");

        if (!token) {
          return res.status(401).json({
            msg: "No Token. Authorization Denied",
          });
        }
        const decoded = jwt.verify(token, process.env.STUDENTTOKENSECRET);
        studentId = decoded.student.id;
        const payment = await StudentWebinar.findOne({
          student: studentId,
          webinarBought: livestream._id,
          boughtfrom: livestream.school._id,
        });
        if (payment) {
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
          res.status(400).json({ error: "Payment not found" });
        }
      } else {
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
      }
    } else {
      res.status(400).json({ error: "Stream not found" });
    }
  } catch (error) {
    res.status(400).json({ error: "Server error" });
  }
});
// router.get("/watch/:streamKey", async (req, res) => {
//   const { streamKey } = req.params;
//   let studentId = req.student.id;

//   try {
//     const livestream = await LiveWebinar.findOne({ streamKey })
//       .populate("creator")
//       .populate("school");

//     if (livestream) {
//       const payment = await StudentWebinar.findOne({
//         student: studentId,
//         webinarBought: livestream._id,
//         boughtfrom: livestream.school._id,
//       });
//       const planName = await PaymentPlans.findOne({
//         _id: livestream.creator.selectedplan,
//       });
//       if (payment || livestream.fee === 0) {
//         // livestream.streamStarted = timestamp;

//         // if (livestream.timeleft === 0) {
//         //   livestream.timeleft = 2700;
//         // }

//         // await livestream.save();

//         res.json({
//           title: livestream.title,
//           streamkey: livestream.streamKey,
//           isLive: livestream.isLive,
//           firstname: livestream.creator.firstname,
//           lastname: livestream.creator.lastname,
//           username: livestream.creator.username,
//           school: livestream.school.name,
//           planname: planName.planname,
//           timeLeft: livestream.timeleft,
//           avatar: livestream.creator.avatar,
//         });
//       } else {
//         res.status(400).json({ error: "Payment plan not found" });
//       }
//     } else {
//       res.status(400).json({ error: "Stream not found" });
//     }
//   } catch (error) {
//     res.status(400).json({ error: "Server error" });
//   }
// });

// get live streams
// router.get("/streams/:filter", auth, async (req, res) => {
//   // the query only returns the webinars whose startTime is greater than or equal to the current date/time
//   const currentDate = new Date();
//   const currentDateOnly = new Date(
//     currentDate.getFullYear(),
//     currentDate.getMonth(),
//     currentDate.getDate()
//   );

//   let streams = await LiveWebinar.find({
//     creator: req.user.id,
//     startTime: { $gte: currentDateOnly },
//   }).sort({ startTime: 1 });

//   if (!streams) {
//     return res.json({ error: "Stream not found" });
//   }
//   res.json({ streams });
// });
const handleStreamFilter = (value, userStreams) => {
  switch (value) {
    case "unPublished":
      return userStreams.filter((stream) => !stream["isPublished"]);
    case "upComing":
      return userStreams.filter((stream) => !stream["endStatus"]);
    case "NotRecurring":
      return userStreams.filter((stream) => !stream["isRecurring"]);
    case "isRecurring":
      return userStreams.filter((stream) => stream["isRecurring"]);
    case "completed":
      return userStreams.filter((stream) => stream["endStatus"]);
    case "":
      return userStreams ? userStreams : [];

    default:
      // Assume `value` is a valid property name in the stream object
      return userStreams ? userStreams : [];
  }
};

router.get("/streams", auth, async (req, res) => {
  const currentDate = new Date();
  const currentDateOnly = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );

  const filterState = req.query.filter || "";

  if (filterState === "all") {
    let allStreams = await LiveWebinar.find({
      creator: req.user.id,
    }).sort({ startTime: 1 });
    if (!allStreams) {
      return res.json({ error: "Stream not found" });
    }
    res.json({ streams: allStreams });
  } else {
    let streams = await LiveWebinar.find({
      creator: req.user.id,
      startTime: { $gte: currentDateOnly },
    }).sort({ startTime: 1 });

    if (!streams) {
      return res.json({ error: "Stream not found" });
    }

    // Apply the filtering based on the filterState
    const filteredStreams = handleStreamFilter(filterState, streams);

    res.json({ streams: filteredStreams });
  }
});

router.get("/schoolstreams/:schoolName", async (req, res) => {
  let { schoolName } = req.params;
  let school = await School.findOne({ name: schoolName });
  const currentDate = new Date();
  const currentDateOnly = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );

  let streams = await LiveWebinar.find({
    creator: school.createdBy,
    startTime: { $gte: currentDateOnly },
    endStatus: false,
  })
    .populate("creator")
    .sort({ startTime: 1 });

  if (!streams) {
    return res.json({ error: "Stream not found" });
  }
  let publishedStreams = streams.filter((item) => {
    return item.isPublished;
  });
  res.json({ streams: publishedStreams });
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

  res.json({ username: user.username, avatar: user.avatar });
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

router.get("/purge", async (req, res) => {
  await StudentWebinar.deleteMany({});
  await LiveWebinar.deleteMany({});
  res.json("all records deleted");
});

router.delete("/remove/:id", auth, async (req, res) => {
  const { id } = req.params;

  const userId = req.user.id;

  try {
    let webinar = await LiveWebinar.findOne({ _id: id });

    if (!webinar) {
      return res.status(404).json({ error: "Webinar not found" });
    }

    if (webinar.creator.toString() !== userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Remove the webinar
    await LiveWebinar.findByIdAndRemove(id);

    res.json({ message: "Webinar removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
