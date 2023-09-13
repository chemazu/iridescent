"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _Tutorial = _interopRequireDefault(require("../models/Tutorial"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.get("/", async (req, res) => {
  const count = req.query.count;

  try {
    const tutorials = await _Tutorial.default.find({}).limit(parseInt(count));
    res.json(tutorials);
  } catch (error) {
    res.status(500).json({
      errors: error
    });
    console.error(error);
  }
});
router.post("/", (0, _expressValidator.body)("videourl", "video url required").not().isEmpty(), (0, _expressValidator.body)("videoid", "video id required").not().isEmpty(), (0, _expressValidator.body)("title", "video title is required").not().isEmpty(), (0, _expressValidator.body)("duration", "video duration required").not().isEmpty(), async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.json({
      errors: errors.array()
    });
  }

  const {
    videourl,
    videoid,
    title,
    duration
  } = req.body;

  try {
    const newTutorial = new _Tutorial.default({
      videoUrl: videourl,
      videoId: videoid,
      title: title,
      duration: duration
    });
    await newTutorial.save();
    res.json(newTutorial);
  } catch (error) {
    res.status(500).json({
      errors: error
    });
    console.error(error);
  }
});
var _default = router;
exports.default = _default;