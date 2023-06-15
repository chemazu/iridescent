import React from "react";
import { Switch, Route } from "react-router-dom";
import TutorlyCourse from "../dashboard/tutorly-courses/TutorlyCourse";
import Signup from "../dashboard/tutorly-courses/Signup";
import Signin from "../dashboard/tutorly-courses/Signin";
import CartPage from "../dashboard/tutorly-courses/CartPage";
import CoursePreviewPage from "../dashboard/tutorly-courses/CoursePreviewPage";
import ProductPreviewPage from "../dashboard/tutorly-courses/ProductPreviewPage";
import DashboardPage from "../dashboard/tutorly-courses/DashboardHome/DashboardPage";
import CourseContentViewPage from "../dashboard/tutorly-courses/DashboardCourseView/CourseContentViewPage";
import PasswordReset from "../dashboard/tutorly-courses/PasswordReset";
import StudentAuthRoute from "./StudentAuthRoute";
import TutorSignin from "../dashboard/tutorly-courses/TutorSignIn";
import TutorSignup from "../dashboard/tutorly-courses/TutorSignUp";
import TutorAuthRoute from "./TutorAuthRoute";
import TuturDashboardIndexPage from "../dashboard/tutorly-courses/TutorArea/Index/Index";
import TutorCoursesPage from "../dashboard/tutorly-courses/TutorArea/Courses/Courses";
import TutorProductPage from "../dashboard/tutorly-courses/TutorArea/Products/Product";
import TutorPaymentPage from "../dashboard/tutorly-courses/TutorArea/Payments/Payment";
import TutorNotificationPage from "../dashboard/tutorly-courses/TutorArea/Notifications/Notifications";

export const CoursesSubdomainViews = (props) => {
  return (
    <Switch>
      <Route exact path="/" component={TutorlyCourse} />
      <Route exact path="/signup" component={Signup} />
      <Route exact path="/signin" component={Signin} />
      <Route exact path="/cart" component={CartPage} />
      <Route exact path="/password/reset" component={PasswordReset} />
      <Route
        exact
        path="/course/preview/:courseId"
        component={CoursePreviewPage}
      />
      <Route
        exact
        path="/product/preview/:productId"
        component={ProductPreviewPage}
      />
      <StudentAuthRoute
        exact
        path="/dashboard/home"
        component={DashboardPage}
      />
      <StudentAuthRoute
        exact
        path="/dashboard/course/content/:courseId"
        component={CourseContentViewPage}
      />
      <Route exact path="/tutor/register" component={TutorSignup} />
      <Route exact path="/tutor/login" component={TutorSignin} />
      <TutorAuthRoute
        exact
        path="/tutor/dashboard/home"
        component={TuturDashboardIndexPage}
      />
      <TutorAuthRoute
        exact
        path="/tutor/dashboard/courses"
        component={TutorCoursesPage}
      />
      <TutorAuthRoute
        exact
        path="/tutor/dashboard/products"
        component={TutorProductPage}
      />
      <TutorAuthRoute
        exact
        path="/tutor/dashboard/payment"
        component={TutorPaymentPage}
      />
      <TutorAuthRoute
        exact
        path="/tutor/dashboard/notifications"
        component={TutorNotificationPage}
      />
    </Switch>
  );
};
