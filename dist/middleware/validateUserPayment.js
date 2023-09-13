"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _User = _interopRequireDefault(require("../models/User"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const validateUserPayment = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const user = await _User.default.findOne({
      _id: userId
    });

    if (!user) {
      return res.status(404).json({
        msg: "user not found"
      });
    }

    if (user.subscriptionstatus === false) {
      return res.status(403).json({
        msg: "Forbidden Request!"
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      msg: "error processing request"
    });
    console.log(error);
  }
};

var _default = validateUserPayment;
exports.default = _default;