import auth from "../middleware/auth";
import { Router } from "express";
import ClassroomResource from "../models/ClassroomResource";
import School from "../models/School";
const router = Router();

router.post("/:type", [auth], async (req, res) => {
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
      console.log("quizz");
      const { quizHolder, timeStamp, answers, durationInSec } = req.body;
      const newResource = new ClassroomResource({
        quizHolder,
        timeStamp,
        answers,
        durationInSec,
        creator,
        type,
        school,
      });
      await newResource.save();
      res.json({
        message: "Quiz created successfully",
      });
    }
    if (type === "poll") {
      const { title, options, durationInSec, timeStamp } = req.body;
      const newResource = new ClassroomResource({
        title,
        options,
        durationInSec,
        creator,
        timeStamp,
        type,
        school,
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
  const { type } = req.params;

  try {
    const resources = await ClassroomResource.find({ creator, type });

    if (!resources.length) {
      return res
        .status(404)
        .json({ message: "No resources found for the creator." });
    }

    res.json(resources);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the resources." });
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
export default router;
