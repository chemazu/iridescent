import express from "express";
import Order from "../models/Order";

import School from "../models/School";
import Theme from "../models/Theme";
import User from "../models/User";


const router = express.Router();
// Adjust the path as needed

// Define the route to retrieve school logos of top users with the most sales
router.get("/top-users-school-logos", async (req, res) => {
  try {
    // Define the aggregation for finding the top users
    const topUsers = await Order.aggregate([
      {
        $group: {
          _id: "$boughtfrom", // Group by the user who made the purchase
          totalSales: { $sum: "$amount" }, // Calculate the total sales for each user
        },
      },
      {
        $sort: { totalSales: -1 }, // Sort in descending order based on total sales
      },
      {
        $limit: 10, // Limit the results to the top 10 users
      },
    ]);

    // Extract the user IDs from the top users
    const topUserIds = topUsers.map((user) => user._id);
    

    // Find the schools associated with the top users
    const schools = await School.find({ createdBy: { $in: topUserIds } });

    // Extract the school IDs
    const schoolIds = schools.map((school) => school._id);

    // Find the logos for the schools
    const schoolLogos = await Theme.find({ schoolId: { $in: schoolIds } });

    // Extract the logos into a separate array
    const logosArray = schoolLogos.map((school) => school.logo);

    // Send the logos array as a JSON response
    res.json(logosArray);
    console.log(logosArray.length);
    console.log(logosArray);

    logosArray.map((i) => {
      console.log(i);
    });
  } catch (error) {
    console.error("Error retrieving school logos:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving school logos" });
  }
});

router.get('/top-users', async (req, res) => {
    try {
      const result = await Order.aggregate([
        {
          $group: {
            _id: '$boughtfrom',
            orderCount: { $sum: 1 },
          },
        },
        {
          $sort: { orderCount: -1 },
        },
        {
          $limit: 10,
        },
      ]);
  
      const userIds = result.map(item => item._id);
  
      const users = await User.find({ _id: { $in: userIds } }, 'email school firstname lastname')
        .populate('school'); // Populate the 'school' field to get the school data.
  
      const topUsers = users.map(user => {
        return {
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          schoolName: user.school ? user.school.name : null
        };
      });
  
      res.json({ topUsers });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
module.exports = router;
