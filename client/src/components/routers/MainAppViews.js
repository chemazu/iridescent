import React from "react";
import { Switch, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import AdminPrivateRoute from "./AdminPrivateRoute";
import PrivateRouteForToken from "./PrivateRouteForToken";

import Homepage from "../../components/Index";
import PricingPage from "../PricingPage";
import CoursesPage from "../CoursesPage";

// import Prelander from "../home/Perlander";

// lazy(() => import("./components/Home"))

import Signup from "../../components/auth/Signup";
import Signin from "../../components/auth/Signin";
import VerifyAccount from "../../components/auth/VerifyAccount";
import TokenExpired from "../../components/auth/TokenExpired";
import EmailNotification from "../../components/auth/EmailNotification";
import Setpageone from "../../components/account-setup/Setuppageone";
import Setpagetwo from "../../components/account-setup/Setuppagetwo";
import CreateCourse from "../../components/dashboard/create-courses/CreateCourse";
import CreateProduct from "../../components/dashboard/products/CreateProduct";
import Courses from "../../components/dashboard/courses/Courses";
import Products from "../dashboard/products/Products";
import Customize from "../../components/dashboard/customize/Customize";
import ThemeInfo from "../../components/dashboard/customize/ThemeSetupPages/ThemeInfo";
import PreviewPage from "../../components/dashboard/theme-preview/PreviewPage";
import Sales from "../../components/dashboard/sales/Sales";
import Messages from "../../components/dashboard/messages/Messages";
import Notification from "../../components/dashboard/notification/Notification";
import Setting from "../dashboard/settings/Setting";
import BillingInformationPage from "../../components/dashboard/BillingInformationPage";
import PasswordResetPage from "../../components/auth/PasswordReset";
import PasswordRenewPage from "../../components/auth/PasswordRenew";
import NotFoundPage from "../dashboard/404";
import TermsOfUsePrivacyPolicyPage from "../TofPp";

import CourseModules from "../../components/dashboard/create-courses/CreateCourseSetupPages/CourseModules";
import PreviewPageForExistingCourse from "../../components/dashboard/courses/PreviewPageForExistingCourse";
import VideoPreviewPage from "../../components/dashboard/create-courses/CreateCourseSetupPages/VideoPreviewPage";
import PaymentPlansPage from "../../components/dashboard/paymentPlans/PaymentPlans";
import SubscriptionComplete from "../../components/dashboard/paymentPlans/SubscriptionComplete";
import TutorDashboardIndex from "../../components/dashboard/index/Index";
import TutorialsPage from "../../components/dashboard/tutorials/Tutorials";

//  admin component imports
import Overview from "../admin/overview/Overview";
import CourseVerification from "../admin/courseVerification/CourseVerification";
import Report from "../admin/reports/Report";
import Tutors from "../admin/tutors/Tutor";
import CourseReviewVerificationDetailsPage from "../admin/courseVerification/CourseReviewVerificationDetailsPage";
import ProductDetail from "../dashboard/products/ProductDetail";
import LiveWebinar from "../dashboard/live-webinar/LiveWebinar";
import CreateLiveWebinar from "../dashboard/live-webinar/CreateLiveWebinar";
import Stream from "../dashboard/live-webinar/Stream";
import PresenterValidation from "../dashboard/live-webinar/PresenterValidation";

export const MainAppViews = () => {
  return (
    <>
      <Switch>
        <Route exact path="/" component={Homepage} />
        <Route exact path="/pricing" component={PricingPage} />
        <Route exact path="/courses" component={CoursesPage} />
        <Route exact path="/signup" component={Signup} />
        <Route exact path="/signin" component={Signin} />
        <Route exact path="/tofpp" component={TermsOfUsePrivacyPolicyPage} />
        <Route exact path="/:ref_code_name" component={Homepage} />
        <Route
          exact
          path="/verify/prompt/:userId"
          component={EmailNotification}
        />
        <Route exact path="/verify/:token" component={VerifyAccount} />
        <Route exact path="/verify/token/expired" component={TokenExpired} />
        <Route exact path="/password/reset" component={PasswordResetPage} />
        <Route exact path="/password/:token" component={PasswordRenewPage} />
        <PrivateRouteForToken
          exact
          path="/account/setup/stepone"
          component={Setpageone}
        />
        <PrivateRouteForToken
          exact
          path="/account/setup/steptwo"
          component={Setpagetwo}
        />
        <PrivateRoute
          exact
          path="/dashboard/index"
          component={TutorDashboardIndex}
        />
        <PrivateRoute
          exact
          path="/dashboard/createcourse"
          component={CreateCourse}
        />
        <PrivateRoute exact path="/dashboard/courses" component={Courses} />
        <PrivateRoute
          exact
          path="/dashboard/createproduct"
          component={CreateProduct}
        />
        <PrivateRoute
          exact
          path="/dashboard/livewebinar"
          component={LiveWebinar}
        />
        <PrivateRoute
          exact
          path="/dashboard/livewebinar/create"
          component={CreateLiveWebinar}
        />{" "}
        <PrivateRoute
          exact
          path="/dashboard/livewebinar/stream/:roomid"
          component={PresenterValidation}
        />
        <PrivateRoute exact path="/dashboard/products" component={Products} />
        <PrivateRoute
          exact
          path="/dashboard/product/:id"
          component={ProductDetail}
        />
        <PrivateRoute
          exact
          path="/dashboard/course/setup/module"
          component={CourseModules}
        />
        <PrivateRoute
          exact
          path="/dashboard/course/setup/module/:courseId"
          component={PreviewPageForExistingCourse}
        />
        <PrivateRoute
          exact
          path="/dashboard/course/module/vidoepreview/:videoId"
          component={VideoPreviewPage}
        />
        <PrivateRoute exact path="/dashboard/customize" component={Customize} />
        <PrivateRoute
          exact
          path="/dashboard/customize/theme/setup/themeinfo"
          component={ThemeInfo}
        />
        <PrivateRoute
          exact
          path="/dashboard/customize/theme/preview/:themePreviewId"
          component={PreviewPage}
        />
        <PrivateRoute exact path="/dashboard/payment" component={Sales} />
        <PrivateRoute exact path="/dashboard/messages" component={Messages} />
        <PrivateRoute
          exact
          path="/dashboard/notification"
          component={Notification}
        />
        <PrivateRoute exact path="/dashboard/Settings" component={Setting} />
        <PrivateRoute
          exact
          path="/dashboard/plans/payment"
          component={PaymentPlansPage}
        />
        <PrivateRouteForToken
          exact
          path="/dashboard/subscription/complete"
          component={SubscriptionComplete}
        />
        <PrivateRoute
          exact
          path="/dashboard/billing-information"
          component={BillingInformationPage}
        />
        <PrivateRoute
          exact
          path="/dashboard/tutorials"
          component={TutorialsPage}
        />
        {/* admin routes  */}
        <AdminPrivateRoute exact path="/admin/dashboard" component={Overview} />
        <AdminPrivateRoute
          exact
          path="/admin/course"
          component={CourseVerification}
        />
        <AdminPrivateRoute exact path="/admin/report" component={Report} />
        <AdminPrivateRoute exact path="/admin/tutor" component={Tutors} />
        <AdminPrivateRoute
          exact
          path="/admin/course/review/:requestId"
          component={CourseReviewVerificationDetailsPage}
        />
        <Route component={NotFoundPage} />
      </Switch>
    </>
  );
};
