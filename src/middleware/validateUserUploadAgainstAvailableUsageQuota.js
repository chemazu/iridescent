import User from "../models/User";
import mongoose from "mongoose";
import CourseUnit from "../models/CourseUnit";
import PaymentPlans from "../models/PaymentPlans";
import Product from "../models/Product";

const convertBytesToMegabytes = (bytes, decimals = 2) => {
  const megaBytes = 1024 * 1024;
  return (bytes / megaBytes).toFixed(decimals);
};

const validateUserUploadAgainstAvailableUsageQuota = async (req, res, next) => {
  const userId = req.user.id;
  const fileSize = req.params.filesize;

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

    const userCourseuploadSizeSum = await CourseUnit.aggregate([
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

    // upload sum for products
    const userProductUploadSum = await Product.aggregate([
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
    if (
      userCourseuploadSizeSum.length === 0 &&
      userProductUploadSum.length === 0
    ) {
      return next();
    }

    const courseUploadSize =
      userCourseuploadSizeSum.length > 0
        ? userCourseuploadSizeSum[0].uploadtotal
        : 0;
    const productUploadSize =
      userProductUploadSum.length > 0 ? userProductUploadSum[0].uploadtotal : 0;

    const productUploadSizeInMegaBytes =
      convertBytesToMegabytes(productUploadSize);
    const courseUploadSizeInMegabytes =
      convertBytesToMegabytes(courseUploadSize);

    const sumOfallUploadsPlusSizeOfNewUploadFile =
      parseFloat(productUploadSizeInMegaBytes) +
      parseFloat(courseUploadSizeInMegabytes) +
      parseFloat(fileSize);

    // if sum of product to be uploaded and previously uploaded video and products by user
    // is less than the total allowable upload size as per the user plan
    // the continue with operation
    // else let user know..
    if (
      sumOfallUploadsPlusSizeOfNewUploadFile < userPaymentPlan.totaluploadsize
    ) {
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
