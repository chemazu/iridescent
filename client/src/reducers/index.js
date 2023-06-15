import { combineReducers } from "redux";
import loading from "./loading";
import auth from "./auth";
import school from "./school";
import currentPage from "./currentDashboardPage";
import theme from "./theme";
import course from "./course";
import modules from "./modules";
import courseunit from "./courseunit";
import cart from "./cart";
import student from "./student";
import paymentmodal from "./paymentmodal";
import notification from "./notification";
import subdomain from "./subdomain";
import studentNotification from "./studentNotification";
import tutorials from "./tutorialPlayer";
import preview from "./courseUnitPreviewPlayer";
import tutor from "./tutor";


export default combineReducers({
  auth,
  loading,
  school,
  currentPage,
  theme,
  course,
  modules,
  courseunit,
  cart,
  student,
  paymentmodal,
  notification,
  subdomain,
  studentNotification,
  tutorials,
  preview,
  tutor,

});
