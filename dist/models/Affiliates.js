"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const affiliateSchema = new _mongoose.default.Schema({
  code_name: {
    type: String,
    unique: true
  },
  username: {
    type: String
  },
  firstname: {
    type: String
  },
  lastname: {
    type: String
  },
  email: {
    type: String
  },
  userId: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "user"
  }
}, {
  timestamps: true
});

const Affiliate = _mongoose.default.model("affiliate", affiliateSchema);

var _default = Affiliate;
exports.default = _default;