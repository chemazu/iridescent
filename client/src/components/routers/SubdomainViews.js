import React from "react";
import { Switch, Route } from "react-router-dom";
import SchoolLandingPage from "../school/SchoolPage";
import SchoolCourseItemPreviewPage from "../school/CourseItemDisplayPage";
import SchoolProductItemPreviewPage from "../school/ProductItemDisplayPage";
import SchoolCartPage from "../school/CartPage";
import StudentLoginPage from "../school/Login";
import StudentEnrollmentPage from "../school/Enroll";
import StudentVideosPage from "../school/StudentVideosPage";
import StudentSingleCoursePage from "../school/StudentSingleCoursePage";
import NotificationPage from "../school/Notification/NotificationPage";
import StudentAuthRoute from "./StudentAuthRoute";
import SubdomainNotFoundPage from "../dashboard/Subdomain404";
// import Prelander from "../home/Perlander";
import PasswordReset from "../school/PasswordReset";
import PasswordRenew from "../school/PasswordRenew";
import LiveWebinarPreview from "../school/SchoolSectionsComponent/LiveWebinarPreview";
import StreamValidation from "../dashboard/live-webinar/StreamValidation";


export const SubdomainViews = (props) => {
  return (
    <Switch>
      <Route exact path="/" component={SchoolLandingPage} />
      <Route exact path="/cart" component={SchoolCartPage} />
      <Route
        exact
        path="/preview/:courseItemId"
        component={SchoolCourseItemPreviewPage}
      />
      <Route
        exact
        path="/product/preview/:productItemId"
        component={SchoolProductItemPreviewPage}
      />
      <Route
        exact
        path="/live/preview/:liveItemId"
        component={LiveWebinarPreview}
      />
      <Route exact path="/login" component={StudentLoginPage} />
      <Route exact path="/enroll" component={StudentEnrollmentPage} />
      <StudentAuthRoute
        exact
        path="/dashboard/courses"
        component={StudentVideosPage}
      />
      <StudentAuthRoute
        exact
        path="/dashboard/page/notification"
        component={NotificationPage}
      />
      <StudentAuthRoute
        exact
        path="/dashboard/course/single/:courseId"
        component={StudentSingleCoursePage}
      />
       <Route
          exact
          path="/livewebinar/watch/:roomid"
          component={StreamValidation}
        />
      <Route exact path="/password-reset" component={PasswordReset} />
      <Route exact path="/password/:token" component={PasswordRenew} />
      <Route component={SubdomainNotFoundPage} />
    </Switch>
  );
};
