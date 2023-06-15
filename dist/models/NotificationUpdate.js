"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const notificationsUpdateSchema = new _mongoose.default.Schema({
  user: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'user'
  },
  count: {
    type: Number
  },
  inView: {
    type: Boolean,
    default: false
  }
});

const NotificationUpdate = _mongoose.default.model('notificationupdate', notificationsUpdateSchema);

var _default = NotificationUpdate;
exports.default = _default;