import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAlert } from "react-alert";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import CurrencyFormat from "react-currency-format";
import { Container, Row, Col, Table } from "reactstrap";
import { UPDATE_DASHBOARD_PAGE_COUNTER } from "../../../actions/types";
import DashboardNavbar from "../DashboardNavbar";
import NotificationNavbar from "../NotificationNavbar";
import setAuthToken from "../../../utilities/setAuthToken";
import moment from "moment";
import Cookies from "js-cookie";
import IndexPageChart from "./IndexPageChart";
import PageVisitChart from "./PageVisitChart";

import totalSalesIcon from "../../../images/total-sales-icon.svg";
import studentIcon from "../../../images/students-icon.svg";
import publishedCourseIcon from "../../../images/published-course-icon.svg";
import storageIcon from "../../../images/storage-icon.svg";
import tuturlyHatIcon from "../../../images/tuturly-hat-icon.svg";
import pageVisitIcon from "../../../images/page-visit-icon.svg";

import DashboardStatisticsLoader from "./DashboardStatisticsLoader";
import DashboardGraphLoader from "./DashboardGraphLoader";
import PaymentHistoryLoader from "./PaymentHistoryLoader";

import "../../../custom-styles/dashboard/dashboardlayout.css";
import "../../../custom-styles/dashboard/index.css";

const Index = ({
  updatePageSelector,
  auth: { user },
  school: { schoolDetails },
}) => {
  const [pageLoading, setPageLoading] = useState(true);
  const [courseSalesListing, setCourseSalesListing] = useState([]);
  const [studentsCount, setStudentsCount] = useState(null);
  const [coursesCount, setCoursesCount] = useState(null);
  const [uploadSize, setUploadSize] = useState(null);
  const [salesTotal, setSalesTotal] = useState(null);
  const [totalPageVisit, setTotalPageVisit] = useState(null);
  const [pageVisitChartData, setPageVisitChartData] = useState(null);
  const [salesChartData, setSalesChartData] = useState(null);
  const history = useHistory();
  const alert = useAlert();

  useEffect(() => {
    updatePageSelector(1);
    // eslint-disable-next-line
  }, []);

  const getStudentCount = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.get(
        `/api/v1/student/count/${schoolDetails?._id}`
      );
      setStudentsCount(res.data);
    } catch (error) {
      console.log(error);
      alert.show(error.message);
    }
  };

  const getCourseCount = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.get(`/api/v1/course/count/${user?._id}`);
      setCoursesCount(res.data);
    } catch (error) {
      console.log(error);
      alert.show(error.message);
    }
  };

  const getVideoUploadSize = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.get(`/api/v1/courseunit/uploadsize/${user?._id}`);
      if (res.data[0]) {
        setUploadSize(res.data[0].uploadtotal);
      } else {
        setUploadSize(null);
      }
    } catch (error) {
      console.log(error);
      alert.show(error.message);
    }
  };

  const getSalesTotal = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.get(`/api/v1/order/ordersum`);
      if (res.data[0]) {
        setSalesTotal(res.data[0].salesTotal);
      } else {
        setSalesTotal(null);
      }
    } catch (error) {
      console.log(error);
      alert.show(error.message);
    }
  };

  const getFirstSixCourseSales = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.get("/api/v1/order/orderlisting");
      setCourseSalesListing(res.data);
    } catch (error) {
      console.log(error);
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  const getPageVisitTotalCount = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.get(
        `/api/v1/pagevisit/total/${schoolDetails._id}`
      );
      setTotalPageVisit(res.data);
    } catch (error) {
      console.log(error);
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  const getUserPageVisitAnalysisForChatDisplay = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.get(`/api/v1/pagevisit/${schoolDetails._id}`);
      setPageVisitChartData(res.data);
    } catch (error) {
      console.log(error);
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  const getUserSalesAnalySisForChartDisplay = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.get("/api/v1/order/sales/report/backdate");
      setSalesChartData(res.data);
    } catch (error) {
      console.log(error);
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  const convertBytesToMegabytes = (bytes, decimals = 2) => {
    const megaBytes = 1024 * 1024;
    return (bytes / megaBytes).toFixed(decimals) + " MB";
  };

  // const copySchoolURL = () => {
  //   navigator.clipboard.writeText(`https://${schoolDetails.name}.tuturly.com`);
  //   alert.show("Link Copy successful", {
  //     type: "success",
  //   });
  // };

  const getSchoolUrl = (schoolname) => {
    const host = window.location.host;
    if (host.includes("localhost")) {
      return `http://${schoolname}.${host}`;
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
    window.open(getSchoolUrl(schoolDetails.name), "_blank");
  };

  const getDashboardPageContents = async () => {
    try {
      await getStudentCount();
      await getCourseCount();
      await getVideoUploadSize();
      await getSalesTotal();
      await getFirstSixCourseSales();
      await getPageVisitTotalCount();
      await getUserSalesAnalySisForChartDisplay();
      await getUserPageVisitAnalysisForChatDisplay();
      setPageLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleViewMoreCoursePurchases = () => {
    history.push("/dashboard/payment?tabId=3");
  };

  useEffect(() => {
    if (user && schoolDetails) {
      getDashboardPageContents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, schoolDetails]);

  return (
    <>
      <div className="dashboard-layout">
        <Container fluid>
          <Row>
            <DashboardNavbar />
            <Col className="page-actions__col">
              <div className="page-actions">
                <NotificationNavbar />
                <div className="dashboard-index-page">
                  <div className="index-page-content-container">
                    <Row>
                      <Col xs="12" sm="12" md="12" lg="9">
                        <div className="dashboard-page__header">
                          <h2 className="tutorname mb-3">
                            Welcome {user?.firstname}
                          </h2>
                        </div>

                        <div
                          onClick={handleOpenEditPage}
                          className="dashboard-page__url"
                        >
                          <div className="school-url">
                            https://{schoolDetails?.name}.tuturly.com
                          </div>
                          <div className="copy-button ml-3">
                            <i className="fas fa-mouse mr-2"></i>
                            Click to customize your school page.
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
                          <div className="payment-history__cta">
                            <small className="ml-2">
                              Showing only six(6) most recent purchases
                            </small>
                            <div
                              className="view-more__cta"
                              onClick={handleViewMoreCoursePurchases}
                            >
                              <span className="mr-2">
                                <small>View More</small>
                              </span>
                              <i className="fas fa-arrow-right mt-1"></i>
                            </div>
                          </div>
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
                                              ).format(
                                                "MMMM Do YYYY, h:mm:ss a"
                                              )}
                                            </td>
                                            <td>{`${salesRecord.orderfrom?.firstname} ${salesRecord.orderfrom?.lastname}`}</td>
                                            <td>
                                              {salesRecord?.orderfrom?.email}
                                            </td>
                                            <td>
                                              {
                                                salesRecord?.orderedcourse
                                                  ?.title
                                              }
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
                                        &#x24;
                                        <CurrencyFormat
                                          value={
                                            salesTotal !== null
                                              ? salesTotal
                                              : 0.0
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
    </>
  );
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  school: state.school,
});

const mapDispatchToProps = (dispatch) => ({
  updatePageSelector: (counter) =>
    dispatch({ type: UPDATE_DASHBOARD_PAGE_COUNTER, payload: counter }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Index);
