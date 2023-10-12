import User from "../models/User";
import PaymentPlans from "../models/PaymentPlans";

const validateEnterPriseUser = async (req, res, next) => {
  const userId = req.user.id;
  const IdOfEnterPrisePlan = process.env.ENTERPRISE_PLAN_ID;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ msg: "user not found" });
    }

    const userPaymentPlan = await PaymentPlans.findOne({
      _id: user.selectedplan,
    });

    if (userPaymentPlan._id == IdOfEnterPrisePlan) {
      return next();
    } else {
      return res.status(401).json({ msg: "Not Authorized" });
    }
  } catch (error) {
    res.status(500).send("server error");
    console.log(error);
  }
};

export default validateEnterPriseUser;
