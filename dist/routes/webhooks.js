"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _crypto = _interopRequireDefault(require("crypto"));

var _stripe = _interopRequireDefault(require("stripe"));

var _Wallet = _interopRequireDefault(require("../models/Wallet"));

var _User = _interopRequireDefault(require("../models/User"));

var _Order = _interopRequireDefault(require("../models/Order"));

var _School = _interopRequireDefault(require("../models/School"));

var _PaymentPlans = _interopRequireDefault(require("../models/PaymentPlans"));

var _StudentCourse = _interopRequireDefault(require("../models/StudentCourse"));

var _StudentProduct = _interopRequireDefault(require("../models/StudentProduct"));

var _Sections = _interopRequireDefault(require("../models/Sections"));

var _CourseUnit = _interopRequireDefault(require("../models/CourseUnit"));

var _axios = _interopRequireDefault(require("axios"));

var _getIdFromToken = _interopRequireDefault(require("../utilities/getIdFromToken"));

var _determineActualEaringPerCourseOrder = _interopRequireDefault(require("../utilities/determineActualEaringPerCourseOrder"));

var _server = require("../server");

var _Course = _interopRequireDefault(require("../models/Course"));

var _Product = _interopRequireDefault(require("../models/Product"));

var _decimal = _interopRequireDefault(require("decimal.js"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _convertNairaToDollar = _interopRequireDefault(require("../utilities/convertNairaToDollar"));

var _roundToTwoDecimalPlaces = _interopRequireDefault(require("../utilities/roundToTwoDecimalPlaces"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

const fastMan = _bodyParser.default.json({
  verify: function (req, res, buf, encoding) {
    req.rawBody = buf.toString();
  }
});

router.use(fastMan);
router.use(_express.default.json()); // const stripeServer = stripe(process.env.STRIPE_SECRET_KEY);

const stripeServer = (0, _stripe.default)("sk_test_51NnK8ADC8JSEsIUsVqcjFrFsa2A8m2M7WflVjgtiC3NDHeh80LVqraZhwRxd3qvrbGW3jE2wGydB4dSpQsVp4bbp000hJAukFO"); // This is your Stripe CLI webhook secret for testing your endpoint locally.

const endpointSecret = "whsec_9b287e8b8a88a331234792afbbc94addb2dd307990347034486958b207441186"; // "whsec_85d4a70f39f5afc6cbb5c2230822b429dcfe2789193620fd65d549801618f2af";

router.post("/app", async (req, res) => {
  const paystackKey = process.env.PAYSTACK_PRIVATE_KEY;

  try {
    const hash = _crypto.default.createHmac("sha512", paystackKey).update(JSON.stringify(req.body)).digest("hex"); // if (hash == req.headers["x-paystack-signature"])


    if (true) {
      const event = req.body; // transfer events

      if (event.event === "transfer.success") {
        const withdrawal = await _Wallet.default.findOne({
          transferreference: event.data.reference
        });

        if (withdrawal) {
          withdrawal.status = "success";
        }

        await withdrawal.save();
      }

      if (event.event === "transfer.failed") {
        const withdrawal = await _Wallet.default.findOne({
          transferreference: event.data.reference
        });

        if (withdrawal) {
          withdrawal.status = "failed";
        }

        await withdrawal.save();
      }

      if (event.event === "charge.success") {
        try {
          //check if metadata for cart is present
          if (event.data.metadata.cart && event.data.metadata.studentToken && event.data.metadata.schoolname) {
            // find the school of which the course was purchased from.
            const school = await _School.default.findOne({
              name: event.data.metadata.schoolname
            }).populate("createdBy", ["email", "selectedplan"]); // then use school information to get user payment plan

            const userPaymentPlan = await _PaymentPlans.default.findOne({
              _id: school.createdBy.selectedplan
            }); // we write function for creating course(s) for stdentToken

            const studentId = (0, _getIdFromToken.default)(event.data.metadata.studentToken);

            if (studentId === false) {
              return res.status(400).json({
                msg: "student ID not found"
              });
            }

            const transactionReference = event.data.reference;
            const checkOrderExist = await _Order.default.findOne({
              reference: transactionReference
            });

            if (checkOrderExist) {
              return res.status(400).json({
                msg: "order already exist"
              });
            }

            const purchased_course = event.data.metadata.cart;

            for (let i = 0; i <= purchased_course.length - 1; i++) {
              const [course, product] = await Promise.all([_Course.default.findOne({
                _id: purchased_course[i].itemId
              }), _Product.default.findOne({
                _id: purchased_course[i].itemId
              })]);
              console.log(course, "course");
              console.log(product, "product");

              if (course) {
                console.log("a student course was created");
                const studentCourse = new _StudentCourse.default({
                  // creating the student purchased course
                  student: studentId,
                  // with the model instantiation
                  coursebought: purchased_course[i].itemId,
                  boughtfrom: school._id
                });
                const order = new _Order.default({
                  reference: transactionReference,
                  orderfrom: studentId,
                  orderedcourse: purchased_course[i].itemId,
                  boughtfrom: school.createdBy._id,
                  amount: purchased_course[i].itemPrice,
                  amount_usd: purchased_course[i].itemPriceUSD,
                  ordertype: purchased_course[i].itemType,
                  createdVia: "webhook",
                  tutor: course.tutor !== null ? course.tutor : null,
                  // actual earning function is used to
                  // ensure only the amount after commission of sales are removed is
                  // deducted...
                  actualearning: (0, _determineActualEaringPerCourseOrder.default)(purchased_course[i].itemPrice, userPaymentPlan.percentchargepercoursesale),
                  actualearning_usd: (0, _determineActualEaringPerCourseOrder.default)(purchased_course[i].itemPriceUSD, userPaymentPlan.percentchargepercoursesale)
                });

                try {
                  //create Order for schools admin/tutor
                  const savedStudentCourse = await studentCourse.save();
                  const savedOrder = await order.save();
                  console.log(savedOrder, savedStudentCourse, "line 122 webhooks.js");
                } catch (error) {
                  console.log(error, "line 121 webhooks.js error");
                }
              } else {
                console.log("a student product was created");
                const studentProduct = new _StudentProduct.default({
                  student: studentId,
                  // with the model instantiation
                  productBought: purchased_course[i].itemId,
                  boughtfrom: school._id
                });
                const order = new _Order.default({
                  reference: transactionReference,
                  orderfrom: studentId,
                  orderedcourse: purchased_course[i].itemId,
                  boughtfrom: school.createdBy._id,
                  amount: purchased_course[i].itemPrice,
                  amount_usd: purchased_course[i].itemPriceUSD,
                  ordertype: purchased_course[i].itemType,
                  createdVia: "webhook",
                  tutor: product.tutor !== null ? product.tutor : null,
                  // actual earning function is used to
                  // ensure only the amount after commission of sales are removed is
                  // deducted...
                  actualearning: (0, _determineActualEaringPerCourseOrder.default)(purchased_course[i].itemPrice, userPaymentPlan.percentchargepercoursesale),
                  actualearning_usd: (0, _determineActualEaringPerCourseOrder.default)(purchased_course[i].itemPriceUSD, userPaymentPlan.percentchargepercoursesale)
                });

                try {
                  //create Order for schools admin/tutor
                  const savedStudentProduct = await studentProduct.save();
                  const savedOrder = await order.save();
                  console.log(savedOrder, savedStudentProduct, "line 153 webhooks.js");
                } catch (error) {
                  console.log(error, "line 156 webhooks.js error");
                }
              }
            }

            return res.send("done");
          }
        } catch (error) {
          console.log(error, "line 127 webhooks");
        }
      }

      if (event.event === "subscription.create") {
        try {
          // subscription code starts here...
          const user = await _User.default.findOne({
            email: event.data.customer.email
          }); // run check to see if user has an active subscription

          if (user.subscriptiondata.isSubscribedToPlan === true) {
            // then delete previous subscription
            // with the paystack API
            if (user.subscriptiondata.subscriptioncode !== event.data.subscription_code) {
              // extra check ensures that the code to delete the paystack subscriptions
              // is if and only if this is not a new subscription as in the case of a renewing subscription
              // since this is the same event that would be fired for a renewing subscription.
              // then we delete the old subscription with the paystack API
              // code to get subscrition to be cancelled
              const config = {
                // using test keys
                headers: {
                  Authorization: `Bearer ${process.env.PAYSTACK_PRIVATE_KEY}`,
                  "Content-Type": "application/json"
                }
              };
              const paystack_response = await _axios.default.get(`https://api.paystack.co/subscription/${user.subscriptiondata.subscriptioncode}`, config);
              const {
                data
              } = paystack_response;
              const subCode = data.data.subscription_code;
              const emailToken = data.data.email_token; // code to cancel the subscriptions

              const cancelSubscriptionConfig = {
                // using test keys
                headers: {
                  Authorization: `Bearer ${process.env.PAYSTACK_PRIVATE_KEY}`,
                  "Content-Type": "application/json"
                }
              };
              const cancelSubscriptionBody = JSON.stringify({
                code: subCode,
                token: emailToken
              });

              try {
                await _axios.default.post("https://api.paystack.co/subscription/disable", cancelSubscriptionBody, cancelSubscriptionConfig);
              } catch (error) {
                console.log(error, "error on line 184");
              }
            } // save user subscription code


            user.subscriptiondata.subscriptioncode = event.data.subscription_code;
            user.subscriptiondata.dateOfSubscription = event.data.createdAt;
            user.subscriptiondata.nextPaymentDate = event.data.next_payment_date;
            user.subscriptionstatus = true;
            user.subscriptiondata.cardexpiry = `${event.data.authorization.exp_month}/${event.data.authorization.exp_year.substr(2)}`;
            user.subscriptiondata.cardending = event.data.authorization.last4;
            user.subscriptiondata.cardtype = event.data.authorization.brand;
            user.subscriptiondata.isSubscribedToPlan = true;
            await user.save();
          } else {
            const user = await _User.default.findOne({
              email: event.data.customer.email
            }); // save user subscription code

            user.subscriptiondata.subscriptioncode = event.data.subscription_code;
            user.subscriptiondata.dateOfSubscription = event.data.createdAt;
            user.subscriptiondata.nextPaymentDate = event.data.next_payment_date;
            user.subscriptionstatus = true;
            user.subscriptiondata.cardexpiry = `${event.data.authorization.exp_month}/${event.data.authorization.exp_year.substr(2)}`;
            user.subscriptiondata.cardending = event.data.authorization.last4;
            user.subscriptiondata.cardtype = event.data.authorization.brand;
            user.subscriptiondata.isSubscribedToPlan = true;
            await user.save();
          }
        } catch (error) {
          console.log(error, "line 225 webhooks");
        }
      } // this is used to capture when a valid subscription does not fire
      // or is not payed


      if (event.event === "invoice.update") {
        if (event.data.paid !== true) {
          const user = await _User.default.findOne({
            email: event.data.customer.email
          });
          user.subscriptionstatus = false;
          user.subscriptiondata.isSubscribedToPlan = false;
          await user.save(); // send user an email
          // telling the user that we could not charge the account.
        } else {
          const user = await _User.default.findOne({
            email: event.data.customer.email
          });
          user.subscriptionstatus = true;
          await user.save();
        }
      } // this is where we capture the event where a user
      // cancels an active subscription


      if (event.event === "subscription.disable") {
        const user = await _User.default.findOne({
          email: event.data.customer.email
        }); // if user switched plan
        // then current subscription code is not the same as
        // subscription code that was cancelled
        // so only disable account access if incoming subscription is the same as user subscription

        if (user.subscriptiondata.subscriptioncode === event.data.subscription_code) {
          user.subscriptionstatus = false;
          user.subscriptiondata.isSubscribedToPlan = false;
          user.dateOfCancelledSubscription = new Date.now();
          await user.save();
        }
      }
    }

    res.send(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

const addDifferentVideoFormatsToUnitsObject = courseUnit => {
  if (courseUnit.isCloudflareVideoSource === true) return courseUnit;
  const videourl = courseUnit.videourl;
  const webmvideourl = videourl.replace(".mp4", ".webm");
  const ogvvideourl = videourl.replace(".mp4", ".ogv");
  return { ...courseUnit,
    webmvideourl,
    ogvvideourl
  };
};

const endPointBodyParser = _bodyParser.default.json({
  verify: function (req, res, buf, encoding) {
    req.rawBody = buf.toString();
  }
});

router.post("/cloudflare/upload/success/notification", endPointBodyParser, async (req, res) => {
  const signature = req.headers["webhook-signature"];

  try {
    const signatureArray = signature.split(",");
    const timeValFromSignature = signatureArray[0].split("=")[1];
    const signatureSourceString = `${timeValFromSignature}.${req.rawBody}`;
    const sigValFromSignature = signatureArray[1].split("=")[1];
    const key = process.env.CLOUDFLARE_WEBHOOK_SECRET;

    const hash = _crypto.default.createHmac("sha256", key).update(signatureSourceString).digest("hex");

    console.log(_crypto.default.timingSafeEqual(Buffer.from(sigValFromSignature), Buffer.from(hash)), "output from the cloudflare compare function");
    const {
      readyToStream,
      status,
      uid,
      thumbnail,
      size,
      duration,
      playback
    } = req.body; // find course unit with video ID

    const courseUnit = await _CourseUnit.default.findOne({
      videopublicid: uid
    }); // find video section with video ID

    const validFoundSection = await _Sections.default.findOne({
      "video.videopublicid": uid
    });

    if (!courseUnit && !validFoundSection) {
      return res.status(403).json({
        error: "invalid uid"
      });
    }

    if (courseUnit) {
      if (readyToStream === true) {
        // if success
        if (status.state == "ready") {
          courseUnit.isStreamReady = true;
          courseUnit.videothumbnail = thumbnail;
          courseUnit.file_size = size;
          courseUnit.duration = duration;
          courseUnit.cloudflare_hsl_videourl = playback.hls;
          courseUnit.cloudflare_dash_videourl = playback.dash;
          courseUnit.isCloudflareVideoSource = true;
          await courseUnit.save();

          _server.io.emit("unit-update", addDifferentVideoFormatsToUnitsObject(courseUnit));
        } //  if error with video upload


        if (status.state == "error") {
          courseUnit.isCloudflareVideoErrorState = true;
          courseUnit.cloudflare_error_message = status.errReasonCode;
          await courseUnit.save();

          _server.io.emit("unit-update", addDifferentVideoFormatsToUnitsObject(courseUnit));
        }
      }
    } else if (validFoundSection) {
      if (status.state == "ready") {
        validFoundSection.video.isStreamReady = true;
        validFoundSection.video.cloudflare_hsl_videourl = playback.hls;
        validFoundSection.video.cloudflare_dash_videourl = playback.dash;
        validFoundSection.video.isCloudflareVideoSource = true;
        validFoundSection.video.videoSize = size;
        validFoundSection.video.videoDuration = duration;
        await validFoundSection.save();
      }

      if (status.state == "error") {
        validFoundSection.video.isCloudflareVideoErrorState = true;
        validFoundSection.video.cloudflare_error_message = status.errReasonCode;
        await validFoundSection.save();
      }
    }

    res.json({
      msg: "seen"
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("server error");
  }
});

const convertCurrencyUsedInPurchaseToUsd = async currencyInUse => {
  const url = `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API}/latest/${currencyInUse}`;

  try {
    const response = await _axios.default.get(url);
    const exchangeRateForUSD = response.data.conversion_rates["USD"];
    const exchangeRateForNaira = response.data.conversion_rates["NGN"];
    return {
      usd_rate: exchangeRateForUSD,
      naira_rate: exchangeRateForNaira
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};

router.post("/stripe", _express.default.raw({
  type: "application/json"
}), async (req, res) => {
  console.log(req, "req");
  console.log(req.rawBody, "reqsss");
  console.log(req.body.data, "body");
  const sig = req.headers["stripe-signature"];
  const payload = JSON.stringify(req.body.data.object);
  let event;

  try {
    event = stripeServer.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    console.log(err);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  const paymentIntentSucceededData = event.data.object;
  const currencyUsedInPurchase = paymentIntentSucceededData.currency;
  const ratesData = await convertCurrencyUsedInPurchaseToUsd(currencyUsedInPurchase);
  const usdRate = ratesData.usd_rate;
  const nairaRate = ratesData.naira_rate; // Handle the event

  switch (event.type) {
    case "payment_intent.succeeded":
      // Then define and call a function to handle the event payment_intent.succeeded
      const cartItems = JSON.parse(paymentIntentSucceededData.metadata.cart); // find the school of which the course was purchased from.

      const school = await _School.default.findOne({
        name: paymentIntentSucceededData.metadata.schoolname
      }).populate("createdBy", ["email", "selectedplan"]);
      const userPaymentPlan = await _PaymentPlans.default.findOne({
        _id: school.createdBy.selectedplan
      }); // we write function for creating course(s) for stdentToken

      const studentId = (0, _getIdFromToken.default)(paymentIntentSucceededData.metadata.studentToken);

      for (let i = 0; i <= cartItems.length - 1; i++) {
        const [course, product] = await Promise.all([_Course.default.findOne({
          _id: cartItems[i].itemId
        }), _Product.default.findOne({
          _id: cartItems[i].itemId
        })]);
        const orderAmountInUSD = new _decimal.default(cartItems[i].itemPrice * usdRate);
        const orderAmountInaira = new _decimal.default(cartItems[i].itemPrice * nairaRate);

        if (course) {
          const studentCourse = new _StudentCourse.default({
            // creating the student purchased course
            student: studentId,
            // with the model instantiation
            coursebought: cartItems[i].itemId,
            boughtfrom: school._id
          });
          const order = new _Order.default({
            reference: paymentIntentSucceededData.id,
            orderfrom: studentId,
            orderedcourse: cartItems[i].itemId,
            boughtfrom: school.createdBy._id,
            amount_usd: orderAmountInUSD.toFixed(2),
            amount: orderAmountInaira.toFixed(2),
            ordertype: cartItems[i].itemType,
            createdVia: "webhook",
            tutor: course.tutor !== null ? course.tutor : null,
            // actual earning function is used to
            // ensure only the amount after commission of sales are removed is
            // deducted...
            actualearning: (0, _determineActualEaringPerCourseOrder.default)(orderAmountInaira.toFixed(2), userPaymentPlan.percentchargepercoursesale),
            actualearning_usd: (0, _determineActualEaringPerCourseOrder.default)(orderAmountInUSD.toFixed(2), userPaymentPlan.percentchargepercoursesale)
          }); // this is an instace method that makes the order have a
          // pending date for withdrawals

          order.setPendingOrderDate();

          try {
            //create Order for schools admin/tutor
            await studentCourse.save();
            await order.save();
          } catch (error) {
            console.log(error, "line 573 webhooks.js error");
          }
        } else {
          const studentProduct = new _StudentProduct.default({
            student: studentId,
            // with the model instantiation
            productBought: cartItems[i].itemId,
            boughtfrom: school._id
          });
          const order = new _Order.default({
            reference: paymentIntentSucceededData.id,
            orderfrom: studentId,
            orderedcourse: cartItems[i].itemId,
            boughtfrom: school.createdBy._id,
            amount_usd: orderAmountInUSD.toFixed(2),
            amount: orderAmountInaira.toFixed(2),
            ordertype: cartItems[i].itemType,
            createdVia: "webhook",
            tutor: product.tutor !== null ? product.tutor : null,
            // actual earning function is used to
            // ensure only the amount after commission of sales are removed is
            // deducted...
            actualearning: (0, _determineActualEaringPerCourseOrder.default)(orderAmountInaira.toFixed(2), userPaymentPlan.percentchargepercoursesale),
            actualearning_usd: (0, _determineActualEaringPerCourseOrder.default)(orderAmountInUSD.toFixed(2), userPaymentPlan.percentchargepercoursesale)
          }); // this is an instace method that makes the order have a
          // pending date for withdrawals

          order.setPendingOrderDate();

          try {
            //create Order for schools admin/tutor
            await studentProduct.save();
            await order.save();
          } catch (error) {
            console.log(error, "line 156 webhooks.js error");
          }
        }
      }

      break;
    // ... handle other event types

    case "customer.subscription.created":
      // for when a subscription is just created
      break;

    case "customer.subscription.updated":
      // for the monthly billing circle...
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  } // Return a 200 response to acknowledge receipt of the event


  res.send();
});
router.get("/upload/cloudflare/link/:courseunitId", async (req, res) => {
  const courseUnitId = req.params.courseunitId;

  try {
    // const course = await Course.findOne({ _id: courseUnitId });
    // const courseUnits = await CourseUnit.find({ course: courseUnitId });
    const courseUnit = await _CourseUnit.default.findOne({
      _id: courseUnitId
    });
    const cUnit = courseUnit; // courseUnits.forEach(async (cUnit) => {

    try {
      const {
        videourl,
        name,
        author,
        videopublicid
      } = cUnit;
      const oldVideoId = videopublicid;
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN}`
        }
      };
      const body = {
        url: videourl,
        creator: author,
        allowedOrigins: ["localhost:3000", "*.localhost:3000", "tuturly.com", "*.tuturly.com"],
        meta: {
          name: name
        }
      };
      const axiosres = await _axios.default.post(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/copy`, body, config);

      if (axiosres.data.success === false) {
        console.log(axiosres.data.errors, "errors");
        console.log(axiosres.data.messages, "messages");
        throw new Error("error");
      }

      const {
        uid
      } = axiosres.data.result;
      cUnit.videopublicid = uid;
      cUnit.isCloudflareVideoSource = true;
      cUnit.isStreamReady = false;
      await cUnit.save();
    } catch (error) {
      console.log(error);
      return res.status(500).send("error transfering video");
    } // });
    // course.transferedToCloudflare = true;
    // await course.save();
    // const courseUnits2 = await CourseUnit.find({ course: courseUnitId });


    res.json(courseUnit);
  } catch (error) {
    console.log(error);
    res.status(500).send("server error");
  }
});
router.get("/course/get", async (req, res) => {
  try {
    const foundCourses = new Array();
    const courses = await _Course.default.find({
      transferedToCloudflare: null
    });

    for (let i = 0; i < courses.length; i++) {
      const courseUnitForCourse = await _CourseUnit.default.countDocuments({
        course: courses[i]._id
      });

      if (parseInt(courseUnitForCourse) > 0) {
        foundCourses.push({ ...courses[i].toObject(),
          unitsCount: courseUnitForCourse,
          sn: foundCourses.length + 1
        });
      }
    }

    const totalCount = foundCourses.reduce((prev, curr) => {
      return prev + curr.unitsCount;
    }, 0);
    console.log(foundCourses.length);
    console.log(totalCount, "total units");
    res.json(foundCourses); // two more functions to write
    // 1. get the list of users on free plan who are using above 200mb
    // 3. investigate why deleting course chapter does not delete courseUnit...
    // 63b474d0184dcd002d0036b7 tell owner of that courseId to reupload the introductotry video for the course...
  } catch (error) {
    console.log(error);
    res.status(500).send("server error");
  }
});
router.put("/usd", async (req, res) => {
  try {
    const allWallets = await _Product.default.find({
      price_usd: null
    });

    for (let i = 0; i < allWallets.length; i++) {
      const courseItem = allWallets[i];
      const amountInUsd = await (0, _convertNairaToDollar.default)(courseItem.price, "usd"); // const dataInUsd = await convertNairaToDollar(walletItem.amount, "usd");
      // walletItem["amount_usd"] = roundToTwoDecimalPlaces(amountInUsd);
      // walletItem["actualearning_usd"] = roundToTwoDecimalPlaces(amountInUsd);
      // walletItem["amount_usd"] = roundToTwoDecimalPlaces(dataInUsd);
      // await walletItem.save();

      courseItem["price_usd"] = (0, _roundToTwoDecimalPlaces.default)(amountInUsd);
      await courseItem.save();
    }

    const updatedCourses = await _Product.default.find({
      price_usd: null
    });
    res.json(updatedCourses);
  } catch (error) {
    res.json(error);
  }
});
router.put("/usd/course", async (req, res) => {
  try {
    const allWallets = await _Course.default.find({
      price_usd: null
    });

    for (let i = 0; i < allWallets.length; i++) {
      const courseItem = allWallets[i];
      const amountInUsd = await (0, _convertNairaToDollar.default)(courseItem.price, "usd"); // const dataInUsd = await convertNairaToDollar(walletItem.amount, "usd");
      // walletItem["amount_usd"] = roundToTwoDecimalPlaces(amountInUsd);
      // walletItem["actualearning_usd"] = roundToTwoDecimalPlaces(amountInUsd);
      // walletItem["amount_usd"] = roundToTwoDecimalPlaces(dataInUsd);
      // await walletItem.save();

      courseItem["price_usd"] = (0, _roundToTwoDecimalPlaces.default)(amountInUsd);
      await courseItem.save();
    }

    const updatedCourses = await _Course.default.find({
      price_usd: null
    });
    res.json(updatedCourses);
  } catch (error) {
    res.json(error);
  }
});
router.put("/order/usd", async (req, res) => {
  try {
    const allOrders = await _Order.default.find({
      amount_usd: null
    });

    for (let i = 0; i < allOrders.length; i++) {
      const orderItem = allOrders[i];
      const amountInUsd = await (0, _convertNairaToDollar.default)(orderItem.amount, "usd");
      const actualEarningUsd = await (0, _convertNairaToDollar.default)(orderItem.actualearning, "usd");
      orderItem["amount_usd"] = (0, _roundToTwoDecimalPlaces.default)(amountInUsd);
      orderItem["actualearning_usd"] = (0, _roundToTwoDecimalPlaces.default)(actualEarningUsd);
      await orderItem.save();
    }

    const updatedWallet = await _Order.default.find({});
    res.json(updatedWallet);
  } catch (error) {
    res.json(error);
  }
});
router.put("/wallet/usd", async (req, res) => {
  try {
    const allWallet = await _Wallet.default.find({
      amount_usd: null
    });

    for (let i = 0; i < allWallet.length; i++) {
      const walletItem = allWallet[i];
      const amountInUsd = await (0, _convertNairaToDollar.default)(walletItem.amount, "usd");
      const actualPayout = await (0, _convertNairaToDollar.default)(walletItem.actualPayout, "usd");
      walletItem["amount_usd"] = (0, _roundToTwoDecimalPlaces.default)(amountInUsd);
      walletItem["actualPayout_usd"] = (0, _roundToTwoDecimalPlaces.default)(actualPayout);
      await walletItem.save();
    }

    const updatedWallet = await _Wallet.default.find({});
    res.json(updatedWallet);
  } catch (error) {
    res.json(error);
  }
});
router.get("/sales/data", async (req, res) => {
  try {
    const uniquesOrders = [];
    const orders = await _Order.default.find().populate("boughtfrom", ["firstname", "lastname", "email", "username"]).populate("orderedcourse", ["title", "category"]).select("-_id").select("-reference").select("-createdVia").select("-orderfrom");

    for (let index = 0; index < orders.length; index++) {
      const element = orders[index];
      const found = uniquesOrders.find(item => item.boughtfrom._id === element.boughtfrom._id && item.orderedcourse._id === element.orderedcourse._id);

      if (found === undefined) {
        uniquesOrders.push(element);
      }
    }

    res.json(uniquesOrders);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});
router.get("/token", async (req, res) => {
  const uId = "63c80375fe4f1e002dae17a2";
  const tokenSecret = process.env.JWTSECRET;
  const payload = {
    user: {
      id: uId
    }
  };

  _jsonwebtoken.default.sign(payload, tokenSecret, {
    expiresIn: 900
  }, (err, token) => {
    if (err) throw err;
    res.json({
      token
    });
  });
});
var _default = router;
exports.default = _default;