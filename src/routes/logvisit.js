import express from "express";
import auth from "../middleware/auth";
import Visit from "../models/Visit";
import moment from "moment";

const router = express.Router();

router.post("/create", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = moment().startOf("day");

    const existingVisit = await Visit.findOne({
      user: userId,
      date: {
        $gte: today.toDate(),
        $lte: moment(today).endOf("day").toDate(),
      },
    });

    if (existingVisit) {
      res.json("Visit already logged today");
    } else {
      const newVisit = new Visit({
        user: userId,
      });
      await newVisit.save();
      res.json("Visit logged successfully");
    }
  } catch (error) {
    console.error(error);
    res.status(401).send({ error: "error" });
  }
});

export default router;
