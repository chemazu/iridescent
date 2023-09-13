"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const pageVisitSchema = new _mongoose.default.Schema({
  ipaddress: {
    type: String
  },
  schoolname: {
    type: String
  },
  schooldid: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "school"
  },
  dateofvisit: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});
pageVisitSchema.index({
  schooldid: 1
});
pageVisitSchema.index({
  dateofvisit: 1
});
pageVisitSchema.index({
  dateofvisit: 1,
  schooldid: 1
});
pageVisitSchema.index({
  visitor: 1
});

const PageVisit = _mongoose.default.model("pagevisit", pageVisitSchema);

var _default = PageVisit;
exports.default = _default;