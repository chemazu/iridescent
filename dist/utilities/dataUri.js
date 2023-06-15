"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _parser = _interopRequireDefault(require("datauri/parser"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const dUri = new _parser.default();

const dataUri = (fileExt, buffer) => {
  return dUri.format(fileExt, buffer);
};

var _default = dataUri;
exports.default = _default;