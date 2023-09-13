import React, { useEffect, useState } from "react";
import { useAlert } from "react-alert";
import { useDispatch, connect } from "react-redux";
import Cookies from "js-cookie";
import { getDefaultSchool } from "../../../../../actions/school";

import { Col, Container, Row, Table } from "reactstrap";
import {
  UPDATE_DASHBOARD_PAGE_COUNTER,
  GET_SCHOOL,
} from "../../../../../actions/types";
import TutorDashboardNavbar from "../TutorDashboardNavbar";
import TutorNotificationNavbar from "../TutorNotificationNavbar";
import moment from "moment";
import "../../../../../custom-styles/dashboard/dashboardlayout.css";
import DashboardGraphLoader from "../../../index/DashboardGraphLoader";
import PageVisitChart from "../../../index/PageVisitChart";
import IndexPageChart from "../../../index/IndexPageChart";
import PaymentHistoryLoader from "../../../index/PaymentHistoryLoader";
import DashboardStatisticsLoader from "../../../index/DashboardStatisticsLoader";
import totalSalesIcon from "../../../../../images/total-sales-icon.svg";
import studentIcon from "../../../../../images/students-icon.svg";
import publishedCourseIcon from "../../../../../images/published-course-icon.svg";
import storageIcon from "../../../../../images/storage-icon.svg";
import tuturlyHatIcon from "../../../../../images/tuturly-hat-icon.svg";
import pageVisitIcon from "../../../../../images/page-visit-icon.svg";
import CurrencyFormat from "react-currency-format";
import setAuthToken from "../../../../../utilities/setAuthToken";
import axios from "axios";

const Index = ({ auth: { user }, tutor: { tutorDetails } }) => {
  const [pageLoading, setPageLoading] = useState(true);
  const [courseSalesListing, setCourseSalesListing] = useState([]);
  const [studentsCount, setStudentsCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(null);
  const [uploadSize, setUploadSize] = useState(null);
  const [salesTotal, setSalesTotal] = useState(null);
  const [totalPageVisit, setTotalPageVisit] = useState(null);
  const [pageVisitChartData, setPageVisitChartData] = useState(null);
  const [salesChartData, setSalesChartData] = useState(null);
  const [school, setSchool] = useState({
    courses: ["63ff6a2e6c0f926b5c8637e2"],
    erolledstudent: ["6409d2c11ae1671df43efe3c", "6410e40a4a1030cd0a44a3af"],
    _id: "63ff42e543a8371d3c307bc3",
    name: "courses",
    createdBy: "63ff41bc43a8371d3c307bc2",
    testimonials: [],
    themename: "theme2",
    themepreviewid: "61f7ed63ec9f45303887ac04",
    createdAt: "2023-03-01T12:19:49.972Z",
    updatedAt: "2023-03-14T21:22:31.379Z",
    __v: 3,
  });

  const alert = useAlert();
  const dispatch = useDispatch();

  const updatePage = (index) => {
    dispatch({ type: UPDATE_DASHBOARD_PAGE_COUNTER, payload: index });
  };
  const convertBytesToMegabytes = (bytes, decimals = 2) => {
    const megaBytes = 1024 * 1024;
    return (bytes / megaBytes).toFixed(decimals) + " MB";
  };

  const getStudentCount = async () => {
    if (localStorage.getItem("tutorToken")) {
      setAuthToken(localStorage.getItem("tutorToken"));
    }
    try {
      const res = await axios.get(
        // get tutor student count by tutorid
        `/api/v1/tutor/student/count/${tutorDetails?._id}`
      );
      if (res.data.length === 0) {
        setStudentsCount(0);
      }
      setStudentsCount(res.data[0]?.erolledstudent.length);
    } catch (error) {
      console.log(error);
      alert.show(error.message);
    }
  };
  const getPageVisitTotalCount = async () => {
    if (localStorage.getItem("tutorToken")) {
      setAuthToken(localStorage.getItem("tutorToken"));
    }
    try {
      const res = await axios.get(
        `/api/v1/pagevisit/total/${school._id}`
      );
      setTotalPageVisit(res.data);

    } catch (error) {
      console.log(error);
      alert.show(error.message, {
        type: "error",
      });
    }
  };
  const getUserSalesAnalySisForChartDisplay = async () => {
    if (localStorage.getItem("tutorToken")) {
      setAuthToken(localStorage.getItem("tutorToken"));
    }
    try {
      const res = await axios.get("/api/v1/tutor/sales/report/backdate");

      setSalesChartData(res.data);
    } catch (error) {
      console.log(error);
      alert.show(error.message, {
        type: "error",
      });
    }
  };
  const getUserPageVisitAnalysisForChatDisplay = async () => {
    if (localStorage.getItem("tutorToken")) {
      setAuthToken(localStorage.getItem("tutorToken"));
    }
    try {
      const res = await axios.get(`/api/v1/pagevisit/${school._id}`);
      setPageVisitChartData(res.data);
    } catch (error) {
      console.log(error);
      alert.show(error.message, {
        type: "error",
      });
    }
  };


  const getSchoolUrl = (schoolname) => {
    const host = window.location.host;

    if (host.includes("localhost") && host.includes("courses")) {
      return `http://${host}`;
    }
    const baseDomain = host.split(".")[1];

    return baseDomain.includes("localhost")
      ? `http://${schoolname}.${baseDomain}`
      : `https://${schoolname}.${baseDomain}.com`;
  };

  const setTokenAsCookie = (tokenData) => {
    const host = window.location.host;
    const baseDomain = host.includes("localhost")
      ? ".localhost:3000"
      : `.${host.split(".")[1]}.com`;
    Cookies.set("adminCookie", tokenData, {
      expires: 4,
      secure: false,
      domain: baseDomain,
    });
  };

  const handleOpenEditPage = (e) => {
    e.preventDefault();
    // save use cookie here.
    setTokenAsCookie(localStorage.getItem("token"));
    // open link in new tab
    window.open(getSchoolUrl("courses"), "_blank");
  };

  const getDashboardPageContents = async () => {
    try {
      await getStudentCount();
      // await getCourseCount();
      // await getVideoUploadSize();
      // await getSalesTotal();
      // await getFirstSixCourseSales();
      await getPageVisitTotalCount();
      await getUserSalesAnalySisForChartDisplay();
      await getUserPageVisitAnalysisForChatDisplay();
      // setPageLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  // useEffect(() => {
  //   updatePage(1000);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  useEffect(() => {
    if (tutorDetails && school) {
      getDashboardPageContents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorDetails, school]);
  // }, [tutorDetails, schoolDetails]);
  return (
    <div className="dashboard-layout">
      <Container fluid>
        <Row>
          <TutorDashboardNavbar />
          <Col className="page-actions__col">
            <div className="page-actions">
              <TutorNotificationNavbar />
              <div className="dashboard-index-page">
                <div className="index-page-content-container">
                  <Row>
                    <Col xs="12" sm="12" md="12" lg="9">
                      <div className="dashboard-page__header">
                        <h2 className="tutorname mb-3">
                          Welcome {tutorDetails?.firstname}
                        </h2>
                      </div>

                      <div
                        onClick={handleOpenEditPage}
                        className="dashboard-page__url"
                      >
                        <div className="school-url">
                          https://courses.tuturly.com
                        </div>
                        <div className="copy-button ml-3">
                          <i className="fas fa-copy mr-2"></i>
                          Copy your link
                        </div>
                      </div>

                      {pageLoading ? (
                        <>
                          <DashboardGraphLoader />
                          <br />
                          <DashboardGraphLoader />
                        </>
                      ) : (
                        <div className="dashboard-chart__container">
                          <PageVisitChart
                            labels={pageVisitChartData.labels}
                            datas={pageVisitChartData.datas}
                          />
                          <br />
                          <IndexPageChart
                            labels={salesChartData.labels}
                            datas={salesChartData.datas}
                          />
                        </div>
                      )}

                      {/* payment history section  */}
                      <div className="paymeny-history__section">
                        <h4>Payment History</h4>
                        {/* table starting  */}
                        {pageLoading ? (
                          <PaymentHistoryLoader />
                        ) : (
                          <>
                            <Table
                              className="paymeny-history__table align-items-center table-flush"
                              responsive
                            >
                              <thead className="paymeny-history__table-header">
                                <tr>
                                  <th>Time</th>
                                  <th>Name</th>
                                  <th>Email</th>
                                  <th>Course Paid</th>
                                </tr>
                              </thead>
                              <tbody>
                                {courseSalesListing.length === 0 ? (
                                  <p className="text-center">
                                    Sales Record Not Found
                                  </p>
                                ) : (
                                  <>
                                    {courseSalesListing.map((salesRecord) => (
                                      <>
                                        <tr key={salesRecord._id}>
                                          <td>
                                            {moment(
                                              salesRecord.orderdate
                                            ).format("MMMM Do YYYY, h:mm:ss a")}
                                          </td>
                                          <td>{`${salesRecord.orderfrom?.firstname} ${salesRecord.orderfrom?.lastname}`}</td>
                                          <td>
                                            {salesRecord?.orderfrom?.email}
                                          </td>
                                          <td>
                                            {salesRecord?.orderedcourse?.title}
                                          </td>
                                        </tr>
                                      </>
                                    ))}
                                  </>
                                )}
                              </tbody>
                            </Table>
                          </>
                        )}
                        {/* table ending  */}
                      </div>
                    </Col>

                    <Col xs="12" sm="12" md="12" lg="3">
                      {/* analytics section */}
                      <div className="analytics-section">
                        {pageLoading ? (
                          <DashboardStatisticsLoader />
                        ) : (
                          <>
                            <div className="analytics-container">
                              <Row>
                                <Col
                                  className="mb-3 analytics-column"
                                  xs="12"
                                  sm="6"
                                  md="6"
                                  lg="12"
                                >
                                  <div className="analytics-item">
                                    <div className="analytics-item-img__container">
                                      <img
                                        width={65}
                                        src={tuturlyHatIcon}
                                        alt="..."
                                      />
                                    </div>

                                    <p className="analytics-info">
                                      Tuturly Plan
                                    </p>

                                    <h5 className="analytics-counter">
                                      {user?.selectedplan?.planname}
                                    </h5>
                                  </div>
                                </Col>

                                <Col
                                  className="mb-3 analytics-column"
                                  xs="12"
                                  sm="6"
                                  md="6"
                                  lg="12"
                                >
                                  <div className="analytics-item">
                                    <div className="analytics-item-img__container">
                                      <img src={totalSalesIcon} alt="..." />
                                    </div>

                                    <p className="analytics-info">
                                      Total Sales
                                    </p>

                                    <h5 className="analytics-counter">
                                      &#8358;
                                      <CurrencyFormat
                                        value={
                                          salesTotal !== null ? salesTotal : 0.0
                                        }
                                        displayType="text"
                                        thousandSeparator={true}
                                        decimalScale={2}
                                        fixedDecimalScale={true}
                                      />
                                    </h5>
                                  </div>
                                </Col>
                                <Col
                                  className="mb-3 analytics-column"
                                  xs="12"
                                  sm="6"
                                  md="6"
                                  lg="12"
                                >
                                  <div className="analytics-item">
                                    <div className="analytics-item-img__container">
                                      <img src={storageIcon} alt="..." />
                                    </div>

                                    <p className="analytics-info">
                                      Storage Used (MB)
                                    </p>

                                    <h5 className="analytics-counter">
                                      {convertBytesToMegabytes(uploadSize)}
                                    </h5>
                                  </div>
                                </Col>
                                <Col
                                  className="mb-3 analytics-column"
                                  xs="12"
                                  sm="6"
                                  md="6"
                                  lg="12"
                                >
                                  <div className="analytics-item">
                                    <div className="analytics-item-img__container">
                                      <img
                                        src={publishedCourseIcon}
                                        alt="..."
                                      />
                                    </div>

                                    <p className="analytics-info">
                                      Created Courses
                                    </p>

                                    <h5 className="analytics-counter">
                                      {coursesCount}
                                    </h5>
                                  </div>
                                </Col>
                                <Col
                                  className="mb-3 analytics-column"
                                  xs="12"
                                  sm="6"
                                  md="6"
                                  lg="12"
                                >
                                  <div className="analytics-item">
                                    <div className="analytics-item-img__container">
                                      <img src={studentIcon} alt="..." />
                                    </div>

                                    <p className="analytics-info">
                                      Enrolled Students
                                    </p>

                                    <h5 className="analytics-counter">
                                      {studentsCount}
                                    </h5>
                                  </div>
                                </Col>

                                <Col
                                  className="mb-3 analytics-column"
                                  xs="12"
                                  sm="6"
                                  md="6"
                                  lg="12"
                                >
                                  <div className="analytics-item">
                                    <div className="analytics-item-img__container">
                                      <img src={pageVisitIcon} alt="..." />
                                    </div>

                                    <p className="analytics-info">
                                      Total Page Visits
                                    </p>

                                    <h5 className="analytics-counter">
                                      {totalPageVisit}
                                    </h5>
                                  </div>
                                </Col>
                              </Row>
                            </div>
                          </>
                        )}
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    auth: state.auth,
    tutor: state.tutor,
    school: state.school,
  };
};

const mapDispatchToProps = (dispatch) => ({
  updatePageSelector: (counter) =>
    dispatch({ type: UPDATE_DASHBOARD_PAGE_COUNTER, payload: counter }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Index);
