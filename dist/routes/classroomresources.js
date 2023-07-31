"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _express = require("express");

var _ClassroomResource = _interopRequireDefault(require("../models/ClassroomResource"));

var _School = _interopRequireDefault(require("../models/School"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = (0, _express.Router)();
router.post("/:type", [_auth.default], async (req, res) => {
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
      console.log("quizz");
      const {
        quizHolder,
        timeStamp,
        answers,
        durationInSec
      } = req.body;
      const newResource = new _ClassroomResource.default({
        quizHolder,
        timeStamp,
        answers,
        durationInSec,
        creator,
        type,
        school
      });
      await newResource.save();
      res.json({
        message: "Quiz created successfully"
      });
    }

    if (type === "poll") {
      const {
        title,
        options,
        durationInSec,
        timeStamp
      } = req.body;
      const newResource = new _ClassroomResource.default({
        title,
        options,
        durationInSec,
        creator,
        timeStamp,
        type,
        school
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
  const {
    type
  } = req.params;

  try {
    const resources = await _ClassroomResource.default.find({
      creator,
      type
    });

    if (!resources.length) {
      return res.status(404).json({
        message: "No resources found for the creator."
      });
    }

    res.json(resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while fetching the resources."
    });
  }
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
var _default = router;
exports.default = _default;