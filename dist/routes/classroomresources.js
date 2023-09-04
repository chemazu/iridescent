"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _express = require("express");

var _ClassroomResource = _interopRequireDefault(require("../models/ClassroomResource"));

var _School = _interopRequireDefault(require("../models/School"));

var _PaymentPlans = _interopRequireDefault(require("../models/PaymentPlans"));

var _AdditonalResource = _interopRequireDefault(require("../models/AdditonalResource"));

var _User = _interopRequireDefault(require("../models/User"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = (0, _express.Router)();
router.post("/add-resource", [_auth.default], async (req, res) => {
  const {
    streamKey,
    added,
    transaction_reference,
    amount,
    orderType
  } = req.body;
  const addResource = new _AdditonalResource.default({
    reference: transaction_reference,
    orderfrom: req.user.id,
    amount,
    ordertype: orderType,
    added
  });
  await addResource.save();
  res.json({
    msg: `${added} ${orderType}s have been added`
  });
});
router.post("/create/:type", [_auth.default], async (req, res) => {
  const {
    type
  } = req.params;
  const creator = req.user.id;

  try {
    const creatorSchool = await _School.default.findOne({
      createdBy: req.user.id
    });

    if (!creatorSchool) {
      return res.status(400).json({
        errors: [{
          msg: "school not found"
        }]
      });
    }

    const school = creatorSchool._id;

    if (type === "quiz") {
      const {
        quizHolder,
        timeStamp,
        answers,
        durationInSec,
        persist
      } = req.body;
      const newResource = new _ClassroomResource.default({
        quizHolder,
        timeStamp,
        answers,
        durationInSec,
        creator,
        type,
        school,
        persist
      });
      await newResource.save();
      console.log(type);
      res.json({
        message: "Quiz created successfully"
      });
    }

    if (type === "poll") {
      const {
        title,
        options,
        durationInSec,
        timeStamp,
        persist
      } = req.body;
      const newResource = new _ClassroomResource.default({
        title,
        options,
        durationInSec,
        creator,
        timeStamp,
        type,
        school,
        persist
      });
      await newResource.save();
      res.json({
        message: "Poll created successfully"
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error
    });
  }
});
router.get("/creator-resources/:type", [_auth.default], async (req, res) => {
  const creator = req.user.id;
  let size = 4;
  const {
    type
  } = req.params;
  const page = parseInt(req.query.page) || 1;
  const skip = parseInt(page - 1) * size;
  const limit = parseInt(size);

  try {
    const resources = await _ClassroomResource.default.find({
      creator,
      type,
      persist: true
    }); // .limit(limit)
    // .skip(skip)
    // .sort({ createdAt: -1 });

    const totalPages = Math.ceil(resources.length / size);

    if (!resources.length) {
      return res.json({
        message: "No resources found for the creator."
      });
    } // res.json(resources);


    res.json({
      resources
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while fetching the resources."
    });
  }
});
router.get("/purge", async (req, res) => {
  await _ClassroomResource.default.deleteMany({});
  await _AdditonalResource.default.deleteMany({});
  res.json("all records deleted");
});
router.get("/count", [_auth.default], async (req, res) => {
  const creator = req.user.id;

  try {
    const user = await _User.default.findById(creator);
    const payment = await _PaymentPlans.default.findOne({
      _id: user.selectedplan
    });

    if (payment.planname === "free") {
      const addedPoll = await _AdditonalResource.default.find({
        orderfrom: creator,
        ordertype: "poll"
      });
      const addedQuiz = await _AdditonalResource.default.find({
        orderfrom: creator,
        ordertype: "quiz"
      });
      const pollResources = await _ClassroomResource.default.find({
        creator,
        type: "poll"
      });
      const quizResources = await _ClassroomResource.default.find({
        creator,
        type: "quiz"
      }); // AddResource.aggregate([
      //   {
      //     $match: {
      //       orderfrom: mongoose.Types.ObjectId(creator),
      //       ordertype: "poll",
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: null,
      //       totalAdded: { $sum: "$added" },
      //     },
      //   },
      // ]).exec((err, result) => {
      //   if (err) {
      //     console.error(err);
      //     return;
      //   }
      //   // 'result' will contain an array with one object, which has the total sum
      //   const totalSum = result[0]?.totalAdded || 0;
      //   console.log("Sum of 'added' values:", totalSum);
      // });

      let addedQuizLength = addedQuiz.reduce((accumulator, object) => {
        return accumulator + object.added;
      }, 0);
      let addedPollLength = addedPoll.reduce((accumulator, object) => {
        return accumulator + object.added;
      }, 0);
      let updatedPollCount = pollResources.length - addedPollLength;
      let updatedQuizCount = quizResources.length - addedQuizLength;
      let totalCount = pollResources.length + quizResources.length;
      res.json({
        resourceCount: totalCount,
        paymentInfo: "free",
        pollCount: updatedPollCount,
        quizCount: updatedQuizCount
      });
    } else {
      res.json({
        resourceCount: 0,
        paymentInfo: 0,
        pollCount: 0,
        quizCount: 0
      });
    }
  } catch (error) {} // try {
  //   const addedPoll = await AddResource.find({
  //     orderfrom: creator,
  //     ordertype: "poll",
  //   });
  //   const addedQuiz = await AddResource.find({
  //     orderfrom: creator,
  //     ordertype: "quiz",
  //   });
  //   const pollResources = await ClassroomResource.find({
  //     creator,
  //     type: "poll",
  //   }).populate("creator");
  //   const quizResources = await ClassroomResource.find({
  //     creator,
  //     type: "quiz",
  //   }).populate("creator");
  //   if (pollResources.length > 0 || quizResources.length > 0) {
  //     const payment = await PaymentPlans.findOne({
  //       _id: pollResources[0].creator.selectedplan,
  //     });
  //     console.log(addedPoll, "ap", addedQuiz, "aq");
  //     let updatedPollCount = pollResources.length - addedPoll.length;
  //     let updatedQuizCount = quizResources.length - addedQuiz.length;
  //     let totalCount = pollResources.length + quizResources.length;
  //     res.json({
  //       resourceCount: totalCount,
  //       paymentInfo: payment.planname,
  //       pollCount: updatedPollCount,
  //       quizCount: updatedQuizCount,
  //     });
  //     console.log({
  //       resourceCount: totalCount,
  //       paymentInfo: payment.planname,
  //       pollCount: updatedPollCount,
  //       quizCount: updatedQuizCount,
  //     });
  //   } else {
  //     res.json({
  //       resourceCount: 0,
  //       paymentInfo: 0,
  //       pollCount: 0,
  //       quizCount: 0,
  //     });
  //   }
  //   // const resources = await ClassroomResource.find({ creator }).populate(
  //   //   "creator"
  //   // );
  //   // if (resources.length > 0) {
  //   // const payment = await PaymentPlans.findOne({
  //   //   _id: resources[0].creator.selectedplan,
  //   // });
  //   //   res.json({
  //   //     resourceCount: resources.length,
  //   //     paymentInfo: payment.planname,
  //   //   });
  //   // } else {
  //   //   res.json({
  //   //     resourceCount: 0,
  //   //     paymentInfo: null,
  //   //   });
  //   // }
  // } catch (error) {
  //   console.error(error);
  //   res
  //     .status(500)
  //     .json({ error: "An error occurred while fetching resources." });
  // }

}); // PUT endpoint to update a resource (both quiz and poll)

router.put("/:resourceId", [_auth.default], async (req, res) => {
  const {
    resourceId
  } = req.params;
  const {
    type
  } = req.body;

  try {
    const existingResource = await _ClassroomResource.default.findById(resourceId);

    if (!existingResource) {
      return res.status(404).json({
        error: "Resource not found."
      });
    } // Check if the user is authorized to update the resource (optional, depending on your requirements)


    if (existingResource.creator.toString() !== req.user.id) {
      return res.status(401).json({
        error: "Unauthorized to update this resource."
      });
    }

    if (type === "quiz") {
      const {
        quizHolder,
        timeStamp,
        answers,
        durationInSec
      } = req.body;
      existingResource.quizHolder = quizHolder;
      existingResource.timeStamp = timeStamp;
      existingResource.answers = answers;
      existingResource.durationInSec = durationInSec;
    } else if (type === "poll") {
      const {
        title,
        options,
        durationInSec,
        timeStamp
      } = req.body;
      existingResource.title = title;
      existingResource.options = options;
      existingResource.durationInSec = durationInSec;
      existingResource.timeStamp = timeStamp;
    } else {
      return res.status(400).json({
        error: "Invalid resource type."
      });
    }

    const updatedResource = await existingResource.save();
    res.json({
      message: "Resource updated successfully",
      updatedResource
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while updating the resource."
    });
  }
});
router.get("/:resourceId", async (req, res) => {
  const {
    resourceId
  } = req.params;

  try {
    const resource = await _ClassroomResource.default.findById(resourceId);

    if (!resource) {
      return res.status(404).json({
        error: "Resource not found."
      });
    }

    res.json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while fetching the resource."
    });
  }
});
router.delete("/:resourceId", [_auth.default], async (req, res) => {
  const {
    resourceId
  } = req.params;

  try {
    const deletedResource = await _ClassroomResource.default.findByIdAndRemove(resourceId);

    if (!deletedResource) {
      return res.status(404).json({
        error: "Resource not found."
      });
    }

    res.json({
      message: "Resource deleted successfully",
      deletedResource
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while deleting the resource."
    });
  }
});
var _default = router;
exports.default = _default;