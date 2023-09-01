"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const addResourceSchema = new _mongoose.default.Schema({
  reference: {
    type: String
  },
  orderfrom: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "user"
  },
  added: {
    type: Number
  },
  amount: {
    type: Number
  },
  ordertype: {
    type: String
  },
  orderdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const AddResource = _mongoose.default.model("addResource", addResourceSchema);

var _default = AddResource;
exports.default = _default;