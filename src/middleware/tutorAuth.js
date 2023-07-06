import jwt from "jsonwebtoken";

const tutorAuth = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({
      msg: "No Token. Authorization Denied",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWTSECRET);
    req.tutor = decoded.tutor;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

export default tutorAuth;
