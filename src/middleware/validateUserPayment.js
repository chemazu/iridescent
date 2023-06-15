import User from "../models/User";

const validateUserPayment = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const user = await User.findOne({
      _id: userId,
    });
    if (!user) {
      return res.status(404).json({ msg: "user not found" });
    }
    if (user.subscriptionstatus === false) {
      return res.status(403).json({
        msg: "Forbidden Request!",
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ msg: "error processing request" });
    console.log(error);
  }
};

export default validateUserPayment;
