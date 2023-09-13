"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const tutorAuth = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({
      msg: "No Token. Authorization Denied"
    });
  }

  try {
    const decoded = _jsonwebtoken.default.verify(token, process.env.JWTSECRET);

    req.tutor = decoded.tutor;
    next();
  } catch (error) {
    res.status(401).json({
      msg: "Token is not valid"
    });
  }
};

var _default = tutorAuth;
exports.default = _default;