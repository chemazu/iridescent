import jwt from "jsonwebtoken";

const getUserIdFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWTSECRET);
    return decoded.user.id;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default getUserIdFromToken;
