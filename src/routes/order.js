import express from "express";
import mongoose from "mongoose";
import Order from "../models/Order";
import auth from "../middleware/auth";

import generatePastSixMonths from "../utilities/generatePastSixMonths";

const router = express.Router();

// route to get sales for all time
router.get("/ordersum", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const userOrderSum = await Order.aggregate([
      {
        $match: {
          boughtfrom: mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          salesTotal: {
            $sum: "$actualearning",
          },
        },
      },
    ]);
    res.json(userOrderSum);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

// route to get total sales for the current month
router.get("/ordersum/monthly", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth();

    const start = new Date(year, month, 1);
    const end = new Date(year, start.getMonth() + 1, 1);

    const userOrderMonthlySum = await Order.aggregate([
      {
        $match: {
          $and: [
            { boughtfrom: mongoose.Types.ObjectId(userId) },
            { orderdate: { $gte: start, $lt: end } },
          ],
        },
      },
      {
        $group: {
          _id: null,
          salesTotal: {
            $sum: "$actualearning",
          },
        },
      },
    ]);

    res.json(userOrderMonthlySum);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

const getSalesReportPerMonth = async (period, userId) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const year = period.getFullYear();
  const month = period.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month, 30);

  const earning = await Order.aggregate([
    {
      $match: {
        $and: [
          { boughtfrom: mongoose.Types.ObjectId(userId) },
          { orderdate: { $gte: start, $lt: end } },
        ],
      },
    },
    {
      $group: {
        _id: null,
        salesTotal: {
          $sum: "$actualearning",
        },
      },
    },
  ]);
  if (earning.length === 0) {
    return {
      label: `${months[month]} ${year}`,
      data: 0,
    };
  } else {
    return {
      label: `${months[month]} ${year}`,
      data: earning[0].salesTotal,
    };
  }
};

router.get("/sales/report/backdate", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const [
      sixthMonth,
      fifthMonth,
      fourthMonth,
      thirdMonth,
      secondMonth,
      firstMonth,
    ] = generatePastSixMonths().reverse();
    const labels = [];
    const datas = [];

    await Promise.all([
      getSalesReportPerMonth(sixthMonth, userId),
      getSalesReportPerMonth(fifthMonth, userId),
      getSalesReportPerMonth(fourthMonth, userId),
      getSalesReportPerMonth(thirdMonth, userId),
      getSalesReportPerMonth(secondMonth, userId),
      getSalesReportPerMonth(firstMonth, userId),
    ]).then((values) => {
      values.forEach((value) => {
        labels.push(value.label);
        datas.push(value.data);
      });
      res.json({
        labels,
        datas,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

router.get("/history", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const payment_history = await Order.find({
      boughtfrom: userId,
    })
      .populate("orderfrom", ["firstname", "lastname", "email"])
      .populate("orderedcourse", ["title"]);
    res.json(payment_history);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

// route to get sales listing on dashborad
router.get("/orderlisting", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const payment_history = await Order.find({
      boughtfrom: userId,
    })
      .sort({ created_at: -1 })
      .populate("orderfrom", ["firstname", "lastname", "email"])
      .populate("orderedcourse", ["title"])
      .limit(6);
    res.json(payment_history);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

export default router;
