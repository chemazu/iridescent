"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function roundToTwoDecimalPlaces(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

var _default = roundToTwoDecimalPlaces;
exports.default = _default;