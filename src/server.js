import path from "path";
import express from "express";
import connectDB from "./config/connection";

import cloudinary from "cloudinary";
 

import userRoute from "./routes/user";
import schoolRoute from "./routes/school";
import courseTypeRoute from "./routes/coursetype";
import productTypeRoute from "./routes/producttype";
import CourseRoute from "./routes/course";
import courseChapterRoute from "./routes/coursechapter";
import courseUnitRoute from "./routes/courseunit";
import messageRoute from "./routes/message";
import themeRoute from "./routes/theme";
import themePreviewRoute from "./routes/themepreview";
import commentRoute from "./routes/comment";
import noteRoute from "./routes/note";
import replyRoute from "./routes/reply";
import studentRoute from "./routes/student";
import bankRoute from "./routes/bankdetails";
import studentCourseRoute from "./routes/studentcourse";
import savedCourseRoute from "./routes/savedcourse";
import notificationRoute from "./routes/notification";
import notificationUpdateRoute from "./routes/notificationupdate";
import orderRoute from "./routes/order";
import walletRoute from "./routes/wallet";
import paymentplansRoute from "./routes/paymentplans";
import studentNotificationRoute from "./routes/studentnotification";
import studentNotificationUpdate from "./routes/studentnotificationupdate";
import sectionsRoute from "./routes/section";
import reportsRoute from "./routes/report";
import pagevisitRoute from "./routes/pagevisit";
import webhooksRoute from "./routes/webhooks";
import prelaunchRoute from "./routes/prelaunchemail";
import tutorialRoute from "./routes/tutorial";
import courseVerificationRoute from "./routes/courseverificationapplication";
import affiliateRoute from "./routes/affiliates";
import productRoute from "./routes/product";
import studentProductRoute from "./routes/studentproduct";
import rootCategoryRoute from "./routes/rootcategory";
import logVisitRoute from "./routes/logvisit";
import tutorRoute from "./routes/tutor";
import classroomresourcesRoute from "./routes/classroomresources";
import livewebinarRoute from "./routes/livewebinar";
import studentWebinarRoute from "./routes/studentwebinar";
import internationalBankDetailsRoute from "./routes/Internationalbankingdetails";
import exchangeRateRoute from "./routes/exchangeRate";
import stripeConnectRoute from "./routes/stripeconnect";
import stripeRoute from "./routes/stripe";
import setupSocketIO from "./socketSetup"; 

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const app = express();
const PORT = process.env.PORT || 5000;

// socket io implementation

const server = setupSocketIO(app);

// middle ware to exclude cloudflare webhooks endpoint path
// from app.use(express.json()) middleware
const unless = function (path, middleware) {
  return function (req, res, next) {
    if (path === req.path) {
      return next();
    } else {
      return middleware(req, res, next);
    }
  };
};

app.use(
  unless(
    "/api/v1/webhooks/cloudflare/upload/success/notification",
    express.json({ extended: false })
  )
);

// call database instance
connectDB();

// app.get('/', (req, res) => {
//   res.send("welcome to our api")
// })

// all application routes will accessed from here
app.use("/api/v1/user", userRoute);
app.use("/api/v1/school", schoolRoute);
app.use("/api/v1/coursetype", courseTypeRoute);
app.use("/api/v1/producttype", productTypeRoute);
app.use("/api/v1/course", CourseRoute);
app.use("/api/v1/coursechapter", courseChapterRoute);
app.use("/api/v1/courseunit", courseUnitRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/theme", themeRoute);
app.use("/api/v1/themepreview", themePreviewRoute);
app.use("/api/v1/bank", bankRoute);
app.use("/api/v1/comment", commentRoute);
app.use("/api/v1/reply", replyRoute);
app.use("/api/v1/note", noteRoute);
app.use("/api/v1/student", studentRoute);
app.use("/api/v1/studentcourse", studentCourseRoute);
app.use("/api/v1/savedcourse", savedCourseRoute);
app.use("/api/v1/notification", notificationRoute);
app.use("/api/v1/notificationupdate", notificationUpdateRoute);
app.use("/api/v1/student/notification", studentNotificationRoute);
app.use("/api/v1/student/notificationupdate", studentNotificationUpdate);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/wallet", walletRoute);
app.use("/api/v1/paymentplans", paymentplansRoute);
app.use("/api/v1/section", sectionsRoute);
app.use("/api/v1/report", reportsRoute);
app.use("/api/v1/pagevisit", pagevisitRoute);
app.use("/api/v1/webhooks", webhooksRoute);
app.use("/api/v1/prelaunch", prelaunchRoute);
app.use("/api/v1/tutorial", tutorialRoute);
app.use("/api/v1/courseverification", courseVerificationRoute);
app.use("/api/v1/affiliate", affiliateRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/studentproduct", studentProductRoute);
app.use("/api/v1/rootcategory", rootCategoryRoute);
app.use("/api/v1/log-visit", logVisitRoute);
app.use("/api/v1/tutor", tutorRoute);
app.use("/api/v1/livewebinar", livewebinarRoute);
app.use("/api/v1/classroomresource", classroomresourcesRoute);
app.use("/api/v1/studentwebinar", studentWebinarRoute);
app.use("/api/v1/bank/international", internationalBankDetailsRoute);
app.use("/api/v1/exchangerate", exchangeRateRoute);
app.use("/api/v1/stripe/connect", stripeConnectRoute);
app.use("/api/v1/stripe", stripeRoute);

const root = require("path").join(__dirname, "../client", "build");

// block of code come's after application routes
if (process.env.NODE_ENV === "production") {
  // set static files
  // app.use(express.static("client/build"));

  // app.get("/*", (req, res) => {
  //   res.sendFile(path.join(__dirname, "../client", "build", "index.html"));
  // });
  app.use(express.static(root));
  app.get("*", (req, res) => {
    res.sendFile("index.html", { root });
  });
}

server.listen(PORT, () => console.log(`App is Listenng on port ${PORT}`));
