"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const determineActualEarningPerCourseOrder = (coursePrice, discount) => {
  const discountInDecimal = parseInt(discount) / 100 * coursePrice;
  return parseInt(coursePrice - discountInDecimal);
};

var _default = determineActualEarningPerCourseOrder;
exports.default = _default;