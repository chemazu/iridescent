"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getUserIdFromToken = token => {
  try {
    const decoded = _jsonwebtoken.default.verify(token, process.env.JWTSECRET);

    return decoded.user.id;
  } catch (error) {
    console.log(error);
    return false;
  }
};

var _default = getUserIdFromToken;
exports.default = _default;