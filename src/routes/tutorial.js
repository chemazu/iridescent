import express from "express";
import { body, validationResult } from "express-validator";
import Tutorial from "../models/Tutorial";

const router = express.Router();

router.get("/", async (req, res) => {
  const count = req.query.count;
  try {
    const tutorials = await Tutorial.find({}).limit(parseInt(count));
    res.json(tutorials);
  } catch (error) {
    res.status(500).json({
      errors: error,
    });
    console.error(error);
  }
});

router.post(
  "/",
  body("videourl", "video url required").not().isEmpty(),
  body("videoid", "video id required").not().isEmpty(),
  body("title", "video title is required").not().isEmpty(),
  body("duration", "video duration required").not().isEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        errors: errors.array(),
      });
    }
    const { videourl, videoid, title, duration } = req.body;
    try {
      const newTutorial = new Tutorial({
        videoUrl: videourl,
        videoId: videoid,
        title: title,
        duration: duration,
      });

      await newTutorial.save();
      res.json(newTutorial);
    } catch (error) {
      res.status(500).json({
        errors: error,
      });
      console.error(error);
    }
  }
);

export default router;
