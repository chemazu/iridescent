"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getIdFromToken = token => {
  try {
    const decoded = _jsonwebtoken.default.verify(token, process.env.STUDENTTOKENSECRET);

    return decoded.student.id;
  } catch (error) {
    console.log(error);
    return false;
  }
};

var _default = getIdFromToken;
exports.default = _default;