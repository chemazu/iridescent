"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _axios = _interopRequireDefault(require("axios"));

var _expressValidator = require("express-validator");

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _studentAuth = _interopRequireDefault(require("../middleware/studentAuth"));

var _School = _interopRequireDefault(require("../models/School"));

var _Theme = _interopRequireDefault(require("../models/Theme"));

var _Course = _interopRequireDefault(require("../models/Course"));

var _Product = _interopRequireDefault(require("../models/Product"));

var _CourseChapter = _interopRequireDefault(require("../models/CourseChapter"));

var _CourseUnit = _interopRequireDefault(require("../models/CourseUnit"));

var _StudentCourse = _interopRequireDefault(require("../models/StudentCourse"));

var _StudentProduct = _interopRequireDefault(require("../models/StudentProduct"));

var _Order = _interopRequireDefault(require("../models/Order"));

var _Student = _interopRequireDefault(require("../models/Student"));

var _PaymentPlans = _interopRequireDefault(require("../models/PaymentPlans"));

var _Notifications = _interopRequireDefault(require("../models/Notifications"));

var _tutuor = require("../emails/notifications/tutuor");

var _student = require("../emails/notifications/student");

var _determineActualEaringPerCourseOrder = _interopRequireDefault(require("../utilities/determineActualEaringPerCourseOrder"));

var _User = _interopRequireDefault(require("../models/User"));

var _Livewebinar = _interopRequireDefault(require("../models/Livewebinar"));

var _StudentWebinar = _interopRequireDefault(require("../models/StudentWebinar"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router(); // private route to get school by logged in user


router.get("/", _auth.default, async (req, res) => {
  try {
    const school = await _School.default.findOne({
      createdBy: req.user.id
    });

    if (!school) {
      return res.status(400).json({
        errors: [{
          msg: "school not found"
        }]
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
    const school = await _School.default.findOne({
      name: schoolname
    });

    if (!school) {
      return res.status(404).json({
        errors: [{
          msg: "school not found"
        }]
      });
    }

    res.json(school);
  } catch (error) {
    res.status(500).send("server error");
  }
}); // route to get school courses by school name

router.get("/courses/:schoolname", async (req, res) => {
  const schoolname = req.params.schoolname;

  try {
    const school = await _School.default.findOne({
      name: schoolname
    });

    if (!school) {
      return res.status(404).json({
        errors: [{
          msg: "school not found"
        }]
      });
    }

    const courses = await _Course.default.find({
      school: school._id,
      published: true
    }).populate("author");
    res.json(courses);
  } catch (error) {
    console.log(error);
    res.status(500).send("server error");
  }
}); // route to get school products by school name

router.get("/products/:schoolname", async (req, res) => {
  const schoolname = req.params.schoolname;

  try {
    const school = await _School.default.findOne({
      name: schoolname
    });

    if (!school) {
      return res.status(404).json({
        errors: [{
          msg: "school not found"
        }]
      });
    }

    const products = await _Product.default.find({
      school: school._id,
      published: true
    }).populate("author");
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).send("server error");
  }
}); // private route to update school theme

router.put("/theme/:id", _auth.default, async (req, res) => {
  try {
    const themeid = req.params.id;
    let school = await _School.default.findOne({
      createdBy: req.user.id
    });
    let theme = await _Theme.default.findOne({
      _id: themeid
    });

    if (!school) {
      return res.status(400).json({
        errors: [{
          msg: "school not found"
        }]
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
}); // route to get specific course by courseID
// schoolname is searched to ensure valid school is used

router.get("/:schoolname/:courseID", async (req, res) => {
  const schoolName = req.params.schoolname;
  const courseId = req.params.courseID;

  try {
    const school = await _School.default.findOne({
      name: schoolName
    });

    if (!school) {
      return res.status(404).json({
        errors: [{
          msg: "school not found"
        }]
      });
    }

    const course = await _Course.default.findOne({
      _id: courseId
    }).populate("coursechapters");
    const courseUnitsInCourse = await _CourseUnit.default.find({
      course: course._id
    });
    const courseChapterCount = await _CourseChapter.default.countDocuments({
      course: course._id
    });
    const durationSum = courseUnitsInCourse.reduce((prev, curr) => {
      return Number(prev) + Number(curr.duration);
    }, 0);
    res.json({
      course,
      courseduration: durationSum,
      episodes: courseChapterCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
}); // route to get specific product by productID
// schoolname is searched to ensure valid school is used

router.get("/product/:schoolname/:productId", async (req, res) => {
  const schoolName = req.params.schoolname;
  const productId = req.params.productId;

  try {
    const school = await _School.default.findOne({
      name: schoolName
    });

    if (!school) {
      return res.status(404).json({
        errors: [{
          msg: "school not found"
        }]
      });
    }

    const product = await _Product.default.findOne({
      _id: productId
    });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
}); // route to get course Modules by CourseId

router.get("/course/module/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const courseChapters = await _CourseChapter.default.find({
      course: courseId
    }).populate("courseunit");
    res.json(courseChapters);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
}); // router.get('/:schoolname/check/paymentmethods', async (req, res) => {
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
    const courseExists = await _StudentCourse.default.findOne({
      student: studentId,
      coursebought: itemId
    });
    return courseExists === null ? false : true;
  }

  if (type === "product") {
    const productExist = await _StudentProduct.default.findOne({
      student: studentId,
      productBought: itemId
    });
    return productExist === null ? false : true;
  }

  if (type === "webinar") {
    const webinarExist = await _StudentWebinar.default.findOne({
      student: studentId,
      webinarBought: itemId
    });
    console.log(webinarExist);
    return webinarExist === null ? false : true;
  }
};

router.post("/purchase/validate", _studentAuth.default, [(0, _expressValidator.body)("purchased_course", "purchased course cannot be empty")], async (req, res) => {
  try {
    const {
      purchased_course
    } = req.body;
    const coursesIdToCheck = [];

    for (let i = 0; i <= purchased_course.length - 1; i++) {
      coursesIdToCheck.push(checkIfCourseIsPurchasedByCourseId(req.student.id, purchased_course[i].itemId, purchased_course[i].itemType));
    }

    console.log(coursesIdToCheck, "checker");
    const validateCourseResult = await Promise.all(coursesIdToCheck);
    console.log(validateCourseResult, "checker 2");
    const containsCourseAlreadyPurchased = validateCourseResult.some(result => result === true);
    console.log(containsCourseAlreadyPurchased, "checker 3");
    res.json({
      validation_result: containsCourseAlreadyPurchased
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});
router.post("/course/verify/purchase", _studentAuth.default, [(0, _expressValidator.body)("transaction_reference", "transaction reference can not be empty").not().isEmpty(), (0, _expressValidator.body)("schoolname", "school name cannot be empty").not().isEmpty(), (0, _expressValidator.body)("purchased_course", "purchased course cannot be empty").not().isEmpty()], async (req, res) => {
  try {
    const errors = (0, _expressValidator.validationResult)(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const {
      transaction_reference,
      schoolname,
      purchased_course
    } = req.body;
    let paystack_response = null;
    const school = await _School.default.findOne({
      name: schoolname
    }).populate("createdBy", ["email"]);
    const user = await _User.default.findOne({
      // find user based on school createdById
      _id: school.createdBy._id
    });
    const userPaymentPlan = await _PaymentPlans.default.findOne({
      // find userId to find the users payment plan
      _id: user.selectedplan // with the payment plan ID

    }); // userPaymentPlan.percentchargepercoursesale will be used to
    // get discount for user payment plan

    if (!school) {
      return res.status(400).json({
        errors: [{
          msg: "school not found"
        }]
      });
    }

    const checkOrderExist = await _Order.default.findOne({
      reference: transaction_reference
    });

    if (checkOrderExist) {
      console.log("order already exists", checkOrderExist);
      return res.status(200).json({
        msg: "order already exist",
        status: true
      });
    }

    try {
      const config = {
        headers: {
          // use payment secret key to validate the transaction
          Authorization: `Bearer ${process.env.PAYSTACK_PRIVATE_KEY}`
        }
      };
      paystack_response = await _axios.default.get(`https://api.paystack.co/transaction/verify/${transaction_reference}`, config);
    } catch (error) {
      return res.status(401).send({
        success: false,
        message: "Verification failed"
      });
    }

    const student = await _Student.default.findOne({
      _id: req.student.id
    });

    if (paystack_response.data.status === true) {
      // provision course to the student and create new
      // StudentCourse
      for (let i = 0; i <= purchased_course.length - 1; i++) {
        console.log(purchased_course[i], "here");
        const [course, product, webinar] = await Promise.all([_Course.default.findOne({
          _id: purchased_course[i].itemId
        }), _Product.default.findOne({
          _id: purchased_course[i].itemId
        }), _Livewebinar.default.findOne({
          _id: purchased_course[i].itemId
        })]);
        console.log(course, "course");
        console.log(product, "product");
        console.log(webinar, "livewebinar");

        if (course) {
          console.log("student course was created");
          const studentCourse = new _StudentCourse.default({
            // creating the student purchased course
            student: req.student.id,
            // with the model instantiation
            coursebought: purchased_course[i].itemId,
            boughtfrom: school._id
          });
          const order = new _Order.default({
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
            actualearning: (0, _determineActualEaringPerCourseOrder.default)(purchased_course[i].itemPrice, userPaymentPlan.percentchargepercoursesale)
          });
          await studentCourse.save(); //create Order for schools admin/tutor

          await order.save(); // purchasedCourseId.push(purchased_course[i].itemId)
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
          const studentWebinar = new _StudentWebinar.default({
            student: req.student.id,
            // with the model instantiation
            webinarBought: purchased_course[i].itemId,
            boughtfrom: school._id
          });
          const order = new _Order.default({
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
            actualearning: (0, _determineActualEaringPerCourseOrder.default)(purchased_course[i].itemPrice, userPaymentPlan.percentchargepercoursesale)
          }); // update webinar viewers list
          // await webinar.save();

          await studentWebinar.save(); //create Order for schools admin/tutor

          await order.save();
        } else {
          const studentProduct = new _StudentProduct.default({
            student: req.student.id,
            // with the model instantiation
            productBought: purchased_course[i].itemId,
            boughtfrom: school._id
          });
          const order = new _Order.default({
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
            actualearning: (0, _determineActualEaringPerCourseOrder.default)(purchased_course[i].itemPrice, userPaymentPlan.percentchargepercoursesale)
          });
          await studentProduct.save(); //create Order for schools admin/tutor

          await order.save(); // purchasedCourseId.push(purchased_course[i].itemId)
        }
      }
    } //  create notification and send of notification email


    (0, _tutuor.studentBoughtCourseNotification)(school.createdBy.email, `${student.firstname} ${student.lastname}`, purchased_course);
    const notification = new _Notifications.default({
      user: school.createdBy._id,
      message: purchased_course.length > 1 ? `${student.firstname} purchased Courses or Products or registered for Webinars` : `${student.firstname} purchased a Course or a Product registered for a Webinar `,
      title: `${student.firstname}`,
      type: "course purchase"
    });
    notification.save(); // send off course purchase email to student

    (0, _student.coursePurchaseNotification)(student.email, purchased_course);
    res.json(paystack_response.data);
  } catch (error) {
    console.log(error, "error in the payment flow");
    res.status(500).json(error);
  }
});
var _default = router;
exports.default = _default;