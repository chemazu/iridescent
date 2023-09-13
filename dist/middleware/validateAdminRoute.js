"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _User = _interopRequireDefault(require("../models/User"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const validateAdminRoute = async (req, res, next) => {
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

    if (user.user_type !== "admin") {
      return res.status(401).json({
        msg: "user not authorized"
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

var _default = validateAdminRoute;
exports.default = _default;