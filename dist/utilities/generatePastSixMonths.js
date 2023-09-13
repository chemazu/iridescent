"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _moment = _interopRequireDefault(require("moment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const generatePastSixMonths = () => {
  const pastSixMonthsArray = [];
  const currentDate = new Date();
  pastSixMonthsArray.push(currentDate); // ensures the current month is also accounted for

  for (let i = 1; i <= 5; i++) {
    const current = (0, _moment.default)().subtract(i, "months");
    pastSixMonthsArray.push(current.toDate());
  }

  return pastSixMonthsArray;
};

var _default = generatePastSixMonths;
exports.default = _default;