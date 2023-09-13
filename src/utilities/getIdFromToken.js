import jwt from "jsonwebtoken";

const getIdFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.STUDENTTOKENSECRET);
    return decoded.student.id;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default getIdFromToken;
