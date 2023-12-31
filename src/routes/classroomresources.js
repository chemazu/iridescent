import auth from "../middleware/auth";
import { Router } from "express";
import ClassroomResource from "../models/ClassroomResource";
import School from "../models/School";
import PaymentPlans from "../models/PaymentPlans";
import AddResource from "../models/AdditonalResource";
import User from "../models/User";
import ResourceDeployment from "../models/ResourceDeployment";
const router = Router();

router.post("/add-deployment", [auth], async (req, res) => {
  const { type } = req.body;

  if (!type) {
    return res.status(400).json({ success: false, error: "Type is required." });
  }

  const creator = req.user.id;
  const newDeployment = new ResourceDeployment({
    type,
    creator,
  });
  try {
    await newDeployment.save();
    res.status(201).json({
      success: true,
      message: `${type} created successfully`,
      data: newDeployment, // You can include the created deployment in the response
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to create deployment." });
  }
});

router.get("/deployment-count", [auth], async (req, res) => {
  const creator = req.user.id;

  try {
    const user = await User.findById(creator);
 
    const payment = await PaymentPlans.findOne({
      _id: user.selectedplan,
    });
    if (payment.planname === "free") {
      const addedPoll = await AddResource.find({
        orderfrom: creator,
        ordertype: "poll",
      });
      const addedQuiz = await AddResource.find({
        orderfrom: creator,
        ordertype: "quiz",
      });
      const pollResources = await ResourceDeployment.find({
        creator,
        type: "poll",
      });
      const quizResources = await ResourceDeployment.find({
        creator,
        type: "quiz",
      });
      let addedQuizLength = addedQuiz.reduce((accumulator, object) => {
        return accumulator + object.added || 0;
      }, 0);
      let addedPollLength =
        addedPoll.reduce((accumulator, object) => {
          return accumulator + object.added;
        }, 0) || 0;
      let updatedPollCount = pollResources.length - addedPollLength;
      let updatedQuizCount = quizResources.length - addedQuizLength;

      res.json({
        paymentInfo: "free",
        pollCount: updatedPollCount,
        quizCount: updatedQuizCount,
      });
    } else {
      res.json({
        paymentInfo: 0,
        pollCount: 0,
        quizCount: 0,
      });
    }
  } catch (error) {
    console.log(error);
  }
});
router.post("/add-resource", [auth], async (req, res) => {
  const { streamKey, added, transaction_reference, amount, orderType } =
    req.body;

  const addResource = new AddResource({
    reference: transaction_reference,
    orderfrom: req.user.id,
    amount,
    ordertype: orderType,
    added,
  });
  await addResource.save();
  res.json({ msg: `${added} ${orderType}s have been added` });
});
router.post("/create/:type", [auth], async (req, res) => {
  const { type } = req.params;
  const creator = req.user.id;

  try {
    const creatorSchool = await School.findOne({ createdBy: req.user.id });
    if (!creatorSchool) {
      return res.status(400).json({
        errors: [{ msg: "school not found" }],
      });
    }
    const school = creatorSchool._id;
    if (type === "quiz") {
      const { quizHolder, timeStamp, answers, durationInSec, persist } =
        req.body;
      const newResource = new ClassroomResource({
        quizHolder,
        timeStamp,
        answers,
        durationInSec,
        creator,
        type,
        school,
        persist,
      });
      await newResource.save();
      res.json({
        message: "Quiz created successfully",
      });
    }
    if (type === "poll") {
      const { title, options, durationInSec, timeStamp, persist } = req.body;
      const newResource = new ClassroomResource({
        title,
        options,
        durationInSec,
        creator,
        timeStamp,
        type,
        school,
        persist,
      });
      await newResource.save();
      res.json({
        message: "Poll created successfully",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});
router.get("/creator-resources/:type", [auth], async (req, res) => {
  const creator = req.user.id;
  let size = 4;

  const { type } = req.params;
  const page = parseInt(req.query.page) || 1;
  const skip = parseInt(page - 1) * size;

  const limit = parseInt(size);

  try {
    const resources = await ClassroomResource.find({
      creator,
      type,
      persist: true,
    });

    // .limit(limit)
    // .skip(skip)
    // .sort({ createdAt: -1 });

    const totalPages = Math.ceil(resources.length / size);

    if (!resources.length) {
      return res.json({
        message: "No resources found for the creator.",
      });
    }

    // res.json(resources);
    res.json({
      resources,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the resources." });
  }
});
router.get("/purge", async (req, res) => {
  await ClassroomResource.deleteMany({});
  await AddResource.deleteMany({});
  await ResourceDeployment.deleteMany({});

  res.json("all records deleted");
});
router.get("/count", [auth], async (req, res) => {
  const creator = req.user.id;
  try {
    const user = await User.findById(creator);
    const payment = await PaymentPlans.findOne({
      _id: user.selectedplan,
    });
    if (payment.planname === "free") {
      const addedPoll = await AddResource.find({
        orderfrom: creator,
        ordertype: "poll",
      });
      const addedQuiz = await AddResource.find({
        orderfrom: creator,
        ordertype: "quiz",
      });
      const pollResources = await ClassroomResource.find({
        creator,
        type: "poll",
      });
      const quizResources = await ClassroomResource.find({
        creator,
        type: "quiz",
      });
      const sumAddedPoll = await AddResource.aggregate([
        {
          $match: {
            orderfrom: creator,
            ordertype: "poll",
          },
        },
        {
          $group: {
            _id: null,
            totalAdded: { $sum: "$added" },
          },
        },
      ]);
      const sumAddedQuiz = await AddResource.aggregate([
        {
          $match: {
            orderfrom: creator,
            ordertype: "quiz",
          },
        },
        {
          $group: {
            _id: null,
            totalAdded: { $sum: "$added" },
          },
        },
      ]);

      let addedQuizLength = addedQuiz.reduce((accumulator, object) => {
        return accumulator + object.added || 0;
      }, 0);
      let addedPollLength =
        addedPoll.reduce((accumulator, object) => {
          return accumulator + object.added;
        }, 0) || 0;
      let updatedPollCount = pollResources.length - addedPollLength;
      let updatedQuizCount = quizResources.length - addedQuizLength;
      let totalCount = pollResources.length + quizResources.length;

      res.json({
        resourceCount: totalCount,
        paymentInfo: "free",
        pollCount: updatedPollCount,
        quizCount: updatedQuizCount,
      });
    } else {
      res.json({
        resourceCount: 0,
        paymentInfo: 0,
        pollCount: 0,
        quizCount: 0,
      });
    }
  } catch (error) {
    console.log("error");
  }
});

// PUT endpoint to update a resource (both quiz and poll)
router.put("/:resourceId", [auth], async (req, res) => {
  const { resourceId } = req.params;
  const { type } = req.body;

  try {
    const existingResource = await ClassroomResource.findById(resourceId);
    if (!existingResource) {
      return res.status(404).json({ error: "Resource not found." });
    }

    // Check if the user is authorized to update the resource (optional, depending on your requirements)
    if (existingResource.creator.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ error: "Unauthorized to update this resource." });
    }

    if (type === "quiz") {
      const { quizHolder, timeStamp, answers, durationInSec } = req.body;
      existingResource.quizHolder = quizHolder;
      existingResource.timeStamp = timeStamp;
      existingResource.answers = answers;
      existingResource.durationInSec = durationInSec;
    } else if (type === "poll") {
      const { title, options, durationInSec, timeStamp } = req.body;
      existingResource.title = title;
      existingResource.options = options;
      existingResource.durationInSec = durationInSec;
      existingResource.timeStamp = timeStamp;
    } else {
      return res.status(400).json({ error: "Invalid resource type." });
    }

    const updatedResource = await existingResource.save();
    res.json({
      message: "Resource updated successfully",
      updatedResource,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the resource." });
  }
});
router.get("/:resourceId", async (req, res) => {
  const { resourceId } = req.params;

  try {
    const resource = await ClassroomResource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ error: "Resource not found." });
    }
    res.json(resource);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the resource." });
  }
});
router.delete("/:resourceId", [auth], async (req, res) => {
  const { resourceId } = req.params;

  try {
    const deletedResource = await ClassroomResource.findByIdAndRemove(
      resourceId
    );

    if (!deletedResource) {
      return res.status(404).json({ error: "Resource not found." });
    }

    res.json({
      message: "Resource deleted successfully",
      deletedResource,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the resource." });
  }
});

export default router;
