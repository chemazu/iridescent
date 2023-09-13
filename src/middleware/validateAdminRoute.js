import User from "../models/User";

const validateAdminRoute = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const user = await User.findOne({
      _id: userId,
    });
    if (!user) {
      return res.status(404).json({ msg: "user not found" });
    }

    if (user.user_type !== "admin") {
      return res.status(401).json({
        msg: "user not authorized",
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ msg: "error processing request" });
    console.log(error);
  }
};

export default validateAdminRoute;
