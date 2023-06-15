"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _User = _interopRequireDefault(require("../models/User"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _Course = _interopRequireDefault(require("../models/Course"));

var _CourseUnit = _interopRequireDefault(require("../models/CourseUnit"));

var _PaymentPlans = _interopRequireDefault(require("../models/PaymentPlans"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const convertBytesToMegabytes = (bytes, decimals = 2) => {
  const megaBytes = 1024 * 1024;
  return (bytes / megaBytes).toFixed(decimals);
};

const validateUserCanChoosePlan = async (req, res, next) => {
  const userId = req.user.id;
  const {
    planid
  } = req.body;

  try {
    const tutorsCourseCount = await _Course.default.countDocuments({
      author: userId
    });
    const validPlan = await _PaymentPlans.default.findOne({
      _id: planid
    });
    const uploadSizeSum = await _CourseUnit.default.aggregate([{
      $match: {
        author: _mongoose.default.Types.ObjectId(planid)
      }
    }, {
      $group: {
        _id: null,
        uploadtotal: {
          $sum: "$file_size"
        }
      }
    }]);
    const userUploadSize = uploadSizeSum.length === 0 ? 0 : uploadSizeSum[0].uploadtotal;

    if (tutorsCourseCount < validPlan.coursecount && userUploadSize < validPlan.totaluploadsize) {
      return next();
    } else {
      return res.status(401).json({
        msg: "cannot choose plan"
      });
    }
  } catch (error) {
    res.status(500).send("server error");
    console.log(error);
  }
};

var _default = validateUserCanChoosePlan;
exports.default = _default;