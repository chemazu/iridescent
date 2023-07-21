import express from "express";
import axios from "axios";
import { body, validationResult } from "express-validator";
import auth from "../middleware/auth";
import studentAuth from "../middleware/studentAuth";
import School from "../models/School";
import Theme from "../models/Theme";
import Course from "../models/Course";
import Product from "../models/Product";
import CourseChapter from "../models/CourseChapter";
import CourseUnit from "../models/CourseUnit";
import StudentCourse from "../models/StudentCourse";
import StudentProduct from "../models/StudentProduct";
import Order from "../models/Order";
import Student from "../models/Student";
import PaymentPlans from "../models/PaymentPlans";
import Notification from "../models/Notifications";
import { studentBoughtCourseNotification } from "../emails/notifications/tutuor";
import { coursePurchaseNotification } from "../emails/notifications/student";
import determineActualEarningPerCourseOrder from "../utilities/determineActualEaringPerCourseOrder";
import User from "../models/User";
import LiveWebinar from "../models/Livewebinar";
import StudentWebinar from "../models/StudentWebinar";

const router = express.Router();

// private route to get school by logged in user
router.get("/", auth, async (req, res) => {
  try {
    const school = await School.findOne({
      createdBy: req.user.id,
    });

    if (!school) {
      return res.status(400).json({
        errors: [{ msg: "school not found" }],
      });
    }
    res.json(school);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

router.get("/:schoolname", async (req, res) => {
  const schoolname = req.params.schoolname;
  try {
    const school = await School.findOne({
      name: schoolname,
    });
    if (!school) {
      return res.status(404).json({
        errors: [
          {
            msg: "school not found",
          },
        ],
      });
    }

    res.json(school);
  } catch (error) {
    res.status(500).send("server error");
  }
});

// route to get school courses by school name
router.get("/courses/:schoolname", async (req, res) => {
  const schoolname = req.params.schoolname;
  try {
    const school = await School.findOne({
      name: schoolname,
    });
    if (!school) {
      return res.status(404).json({
        errors: [
          {
            msg: "school not found",
          },
        ],
      });
    }
    const courses = await Course.find({
      school: school._id,
      published: true,
    }).populate("author");
    res.json(courses);
  } catch (error) {
    console.log(error);
    res.status(500).send("server error");
  }
});

// route to get school products by school name
router.get("/products/:schoolname", async (req, res) => {
  const schoolname = req.params.schoolname;
  try {
    const school = await School.findOne({
      name: schoolname,
    });
    if (!school) {
      return res.status(404).json({
        errors: [
          {
            msg: "school not found",
          },
        ],
      });
    }
    const products = await Product.find({
      school: school._id,
      published: true,
    }).populate("author");
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).send("server error");
  }
});

// private route to update school theme
router.put("/theme/:id", auth, async (req, res) => {
  try {
    const themeid = req.params.id;

    let school = await School.findOne({
      createdBy: req.user.id,
    });

    let theme = await Theme.findOne({ _id: themeid });

    if (!school) {
      return res.status(400).json({
        errors: [{ msg: "school not found" }],
      });
    }

    school.themename = theme.name;
    school.themeid = theme._id;

    await school.save();

    res.json(school);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// route to get specific course by courseID
// schoolname is searched to ensure valid school is used
router.get("/:schoolname/:courseID", async (req, res) => {
  const schoolName = req.params.schoolname;
  const courseId = req.params.courseID;

  try {
    const school = await School.findOne({
      name: schoolName,
    });
    if (!school) {
      return res.status(404).json({
        errors: [
          {
            msg: "school not found",
          },
        ],
      });
    }

    const course = await Course.findOne({
      _id: courseId,
    }).populate("coursechapters");

    const courseUnitsInCourse = await CourseUnit.find({
      course: course._id,
    });

    const courseChapterCount = await CourseChapter.countDocuments({
      course: course._id,
    });

    const durationSum = courseUnitsInCourse.reduce((prev, curr) => {
      return Number(prev) + Number(curr.duration);
    }, 0);

    res.json({
      course,
      courseduration: durationSum,
      episodes: courseChapterCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// route to get specific product by productID
// schoolname is searched to ensure valid school is used
router.get("/product/:schoolname/:productId", async (req, res) => {
  const schoolName = req.params.schoolname;
  const productId = req.params.productId;

  try {
    const school = await School.findOne({
      name: schoolName,
    });
    if (!school) {
      return res.status(404).json({
        errors: [
          {
            msg: "school not found",
          },
        ],
      });
    }
    const product = await Product.findOne({ _id: productId });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// route to get course Modules by CourseId
router.get("/course/module/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const courseChapters = await CourseChapter.find({
      course: courseId,
    }).populate("courseunit");

    res.json(courseChapters);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// router.get('/:schoolname/check/paymentmethods', async (req, res) => {
//     const schoolname = req.params.schoolname
//     try {
//         const school = await School.findOne({
//             name: schoolname
//         })
//         if(!school){
//             return res.status(404).json({errors : [{
//                 msg: "school not found"
//             }]})
//         }

//         const availableSchoolPaymentMethods = await SchoolPaymentMethod.find({
//             school: school._id
//         }).select('-privatekey')

//         res.json(availableSchoolPaymentMethods)

//     } catch (error) {
//         console.error(error)
//         res.status(500).send("Internal server error")
//     }
// })

const checkIfCourseIsPurchasedByCourseId = async (studentId, itemId, type) => {
  console.log(studentId, itemId, type);
  if (type === "course") {
    const courseExists = await StudentCourse.findOne({
      student: studentId,
      coursebought: itemId,
    });
    return courseExists === null ? false : true;
  }
  if (type === "product") {
    const productExist = await StudentProduct.findOne({
      student: studentId,
      productBought: itemId,
    });
    return productExist === null ? false : true;
  }
  if (type === "webinar") {
    const webinarExist = await StudentWebinar.findOne({
      student: studentId,
      webinarBought: itemId,
    });
    console.log(webinarExist);
    return webinarExist === null ? false : true;
  }
};
router.post(
  "/purchase/validate",
  studentAuth,
  [body("purchased_course", "purchased course cannot be empty")],
  async (req, res) => {
    try {
      const { purchased_course } = req.body;
      const coursesIdToCheck = [];
      for (let i = 0; i <= purchased_course.length - 1; i++) {
        coursesIdToCheck.push(
          checkIfCourseIsPurchasedByCourseId(
            req.student.id,
            purchased_course[i].itemId,
            purchased_course[i].itemType
          )
        );
      }
      console.log(coursesIdToCheck, "checker");
      const validateCourseResult = await Promise.all(coursesIdToCheck);
      console.log(validateCourseResult, "checker 2");

      const containsCourseAlreadyPurchased = validateCourseResult.some(
        (result) => result === true
      );
      console.log(containsCourseAlreadyPurchased, "checker 3");

      res.json({
        validation_result: containsCourseAlreadyPurchased,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
);

router.post(
  "/course/verify/purchase",
  studentAuth,
  [
    body("transaction_reference", "transaction reference can not be empty")
      .not()
      .isEmpty(),
    body("schoolname", "school name cannot be empty").not().isEmpty(),
    body("purchased_course", "purchased course cannot be empty")
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
        });
      }
      const { transaction_reference, schoolname, purchased_course } = req.body;
      let paystack_response = null;

      const school = await School.findOne({
        name: schoolname,
      }).populate("createdBy", ["email"]);

      const user = await User.findOne({
        // find user based on school createdById
        _id: school.createdBy._id,
      });

      const userPaymentPlan = await PaymentPlans.findOne({
        // find userId to find the users payment plan
        _id: user.selectedplan, // with the payment plan ID
      }); // userPaymentPlan.percentchargepercoursesale will be used to
      // get discount for user payment plan

      if (!school) {
        return res.status(400).json({
          errors: [
            {
              msg: "school not found",
            },
          ],
        });
      }
      const checkOrderExist = await Order.findOne({
        reference: transaction_reference,
      });

      if (checkOrderExist) {
        console.log("order already exists", checkOrderExist);
        return res
          .status(200)
          .json({ msg: "order already exist", status: true });
      }

      try {
        const config = {
          headers: {
            // use payment secret key to validate the transaction
            // Authorization: `Bearer ${process.env.PAYSTACK_PRIVATE_KEY}`,
            Authorization:
              "Bearer sk_test_028c735e6567db9ff7614c5636389f9801e49c6d",
          },
        };

        paystack_response = await axios.get(
          `https://api.paystack.co/transaction/verify/${transaction_reference}`,
          config
        );
      } catch (error) {
        return res.status(401).send({
          success: false,
          message: "Verification failed",
          Authorization: `Bearer ${process.env.PAYSTACK_PRIVATE_KEY}`,
        });
      }

      const student = await Student.findOne({
        _id: req.student.id,
      });

      if (paystack_response.data.status === true) {
        // provision course to the student and create new
        // StudentCourse
        for (let i = 0; i <= purchased_course.length - 1; i++) {
          console.log(purchased_course[i], "here");
          const [course, product, webinar] = await Promise.all([
            Course.findOne({ _id: purchased_course[i].itemId }),
            Product.findOne({ _id: purchased_course[i].itemId }),
            LiveWebinar.findOne({ _id: purchased_course[i].itemId }),
          ]);
          console.log(course, "course");
          console.log(product, "product");
          console.log(webinar, "livewebinar");

          if (course) {
            console.log("student course was created");
            const studentCourse = new StudentCourse({
              // creating the student purchased course
              student: req.student.id, // with the model instantiation
              coursebought: purchased_course[i].itemId,
              boughtfrom: school._id,
            });
            const order = new Order({
              reference: transaction_reference,
              orderfrom: req.student.id,
              orderedcourse: purchased_course[i].itemId,
              boughtfrom: school.createdBy._id,
              amount: purchased_course[i].itemPrice,
              createdVia: "callback",
              ordertype: purchased_course[i].itemType,
              tutor: course.tutor !== null ? course.tutor : null,
              // actual earning function is used to
              // ensure only the amount after commission of sales are removed is
              // deducted...
              actualearning: determineActualEarningPerCourseOrder(
                purchased_course[i].itemPrice,
                userPaymentPlan.percentchargepercoursesale
              ),
            });
            await studentCourse.save();
            //create Order for schools admin/tutor
            await order.save();
            // purchasedCourseId.push(purchased_course[i].itemId)
          }
          if (webinar) {
            // webinar.viewers.push(req.student.id);
            // const findWebPurchase = await StudentWebinar.findOne({
            //   student: req.student.id, // with the model instantiation
            //   webinarBought: purchased_course[i].itemId,
            // });
            // if (findWebPurchase) {
            //   console.log(findWebPurchase,"web purchse")
            // } else {
            let flag = await StudentWebinar.find();
            console.log(flag, "flag");
            const studentWebinar = new StudentWebinar({
              student: req.student.id, // with the model instantiation
              webinarBought: purchased_course[i].itemId,
              boughtfrom: school._id,
            });

            const order = new Order({
              reference: transaction_reference,
              orderfrom: req.student.id,
              orderedcourse: purchased_course[i].itemId,
              boughtfrom: school.createdBy._id,
              amount: purchased_course[i].itemPrice,
              createdVia: "callback",
              ordertype: purchased_course[i].itemType,
              tutor: webinar.tutor !== null ? webinar.tutor : null,
              // actual earning function is used to
              // ensure only the amount after commission of sales are removed is
              // deducted...
              actualearning: determineActualEarningPerCourseOrder(
                purchased_course[i].itemPrice,
                userPaymentPlan.percentchargepercoursesale
              ),
            });
            // update webinar viewers list
            // await webinar.save();

            await studentWebinar.save();
            //create Order for schools admin/tutor
            await order.save();
          } else {
            const studentProduct = new StudentProduct({
              student: req.student.id, // with the model instantiation
              productBought: purchased_course[i].itemId,
              boughtfrom: school._id,
            });
            const order = new Order({
              reference: transaction_reference,
              orderfrom: req.student.id,
              orderedcourse: purchased_course[i].itemId,
              boughtfrom: school.createdBy._id,
              amount: purchased_course[i].itemPrice,
              createdVia: "callback",
              ordertype: purchased_course[i].itemType,
              tutor: product.tutor !== null ? product.tutor : null,
              // actual earning function is used to
              // ensure only the amount after commission of sales are removed is
              // deducted...
              actualearning: determineActualEarningPerCourseOrder(
                purchased_course[i].itemPrice,
                userPaymentPlan.percentchargepercoursesale
              ),
            });
            await studentProduct.save();
            //create Order for schools admin/tutor
            await order.save();
            // purchasedCourseId.push(purchased_course[i].itemId)
          }
        }
      }

      //  create notification and send of notification email
      studentBoughtCourseNotification(
        school.createdBy.email,
        `${student.firstname} ${student.lastname}`,
        purchased_course
      );
      const notification = new Notification({
        user: school.createdBy._id,
        message:
          purchased_course.length > 1
            ? `${student.firstname} purchased Courses or Products or registered for Webinars`
            : `${student.firstname} purchased a Course or a Product or registered for a Webinar `,
        title: `${student.firstname}`,
        type: "course purchase",
      });

      notification.save();
      // send off course purchase email to student
      coursePurchaseNotification(student.email, purchased_course);
      res.json(paystack_response.data);
    } catch (error) {
      console.log(error, "error in the payment flow");
      res.status(500).json(error);
    }
  }
);

export default router;
