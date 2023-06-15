import User from "../models/User";
import mongoose from "mongoose";
import CourseUnit from "../models/CourseUnit";
import PaymentPlans from "../models/PaymentPlans";

const convertBytesToMegabytes = (bytes, decimals = 2) => {
  const megaBytes = 1024 * 1024;
  return (bytes / megaBytes).toFixed(decimals);
};

const validateUserUploadAgainstAvailableUsageQuota = async (req, res, next) => {
  const userId = req.user.id;
  const videoFileSize = req.params.filesize;

  try {
    const user = await User.findOne({
      _id: userId,
    });
    if (!user) {
      return res.status(404).json({ msg: "user not found" });
    }

    const userPaymentPlan = await PaymentPlans.findOne({
      _id: user.selectedplan,
    });

    const uploadSizeSum = await CourseUnit.aggregate([
      {
        $match: {
          author: mongoose.Types.ObjectId(user._id),
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

    // if user does not have any upload record, then call next to continue
    // with upload process
    if (uploadSizeSum.length === 0) {
      return next();
    }

    const userUploadSize = uploadSizeSum[0].uploadtotal;
    const userUploadSizeInMegaBytes = convertBytesToMegabytes(userUploadSize);
    const userUploadedPlusSumOfNewVideoSize =
      parseFloat(userUploadSizeInMegaBytes) + parseFloat(videoFileSize);

    // if sum of video to be uploaded and previously uploaded video of user
    // is less that the total allowable video upload as per the user plan
    // the continue with operation
    // else let user know..
    if (userUploadedPlusSumOfNewVideoSize < userPaymentPlan.totaluploadsize) {
      next();
    } else {
      return res.status(401).json({ msg: "user video upload quota exceeded." });
    }
  } catch (error) {
    res.status(500).json({ msg: "error processing request" });
    console.log(error);
  }
};

export default validateUserUploadAgainstAvailableUsageQuota;
