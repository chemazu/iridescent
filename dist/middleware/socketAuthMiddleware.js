"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _User = _interopRequireDefault(require("../models/User"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const socketAuthMiddleware = async (socket, next) => {
  const token = socket.handshake.query.authorization?.split(" ")[1];
  console.log(token);

  if (!token) {
    console.log("no token brev");
  }

  try {
    const decoded = _jsonwebtoken.default.verify(token, process.env.JWTSECRET);

    console.log(decoded, "mmap"); // let userDetails = await User.findById(decoded.user.id);
    // socket.user = {
    //   id: userDetails._id,
    //   username: userDetails.name,
    // };
    // console.log(socket);

    next();
  } catch (error) {
    console.log(error);
  }
};

var _default = socketAuthMiddleware;
exports.default = _default;