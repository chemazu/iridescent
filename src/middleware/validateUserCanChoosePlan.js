import User from "../models/User";
import mongoose from "mongoose";
import Course from "../models/Course";
import CourseUnit from "../models/CourseUnit";
import PaymentPlans from "../models/PaymentPlans";

const convertBytesToMegabytes = (bytes, decimals = 2) => {
  const megaBytes = 1024 * 1024;
  return (bytes / megaBytes).toFixed(decimals);
};

const validateUserCanChoosePlan = async (req, res, next) => {
  const userId = req.user.id;
  const { planid } = req.body;

  try {
    const tutorsCourseCount = await Course.countDocuments({
      author: userId,
    });

    const validPlan = await PaymentPlans.findOne({
      _id: planid,
    });

    const uploadSizeSum = await CourseUnit.aggregate([
      {
        $match: {
          author: mongoose.Types.ObjectId(planid),
        },
      },
      {
        $group: {
          _id: null,
          uploadtotal: {
            $sum: "$file_size",
          },
        },
      },
    ]);

    const userUploadSize =
      uploadSizeSum.length === 0 ? 0 : uploadSizeSum[0].uploadtotal;

    if (
      tutorsCourseCount < validPlan.coursecount &&
      userUploadSize < validPlan.totaluploadsize
    ) {
      return next();
    } else {
      return res.status(401).json({ msg: "cannot choose plan" });
    }
  } catch (error) {
    res.status(500).send("server error");
    console.log(error);
  }
};

export default validateUserCanChoosePlan;
