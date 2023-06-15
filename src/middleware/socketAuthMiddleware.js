import jwt from "jsonwebtoken";
import User from "../models/User";

const socketAuthMiddleware = async (socket, next) => {
  const token = socket.handshake.query.authorization?.split(" ")[1];
  console.log(token);
  if (!token) {
    console.log("no token brev");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWTSECRET);
    console.log(decoded, "mmap");
    // let userDetails = await User.findById(decoded.user.id);
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

export default socketAuthMiddleware;
