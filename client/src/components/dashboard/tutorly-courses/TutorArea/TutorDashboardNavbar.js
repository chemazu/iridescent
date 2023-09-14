import React, { useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Col,
  Nav,
  NavItem,
  NavLink,
  PopoverBody,
  UncontrolledPopover,
} from "reactstrap";
import classnames from "classnames";
import {
  TUTOR_AUTH,
  TUTOR_AUTH_FAILED,
  UPDATE_DASHBOARD_PAGE_COUNTER,
  UPDATE_DASHBOARD_PAGE_COUNTER_TO_DEFAULT,
  TUTOR_LOGOUT,
} from "../../../../actions/types";
import setAuthToken from "../../../../utilities/setAuthToken";
import DashboardLoadingSkeleton from "../../DashboardLoadingSkeleton";
import Logo from "../../../../images/tuturlySvgLogo.svg";
import "../../../../custom-styles/dashboard/dashboardlayout.css";

const TutorDashboardNavbar = ({ tutor, currentPage }) => {
  const dispatch = useDispatch();

  const updatePage = (index) => {
    dispatch({ type: UPDATE_DASHBOARD_PAGE_COUNTER, payload: index });
  };

  const updatePageCountToDefault = () =>
    dispatch({ type: UPDATE_DASHBOARD_PAGE_COUNTER_TO_DEFAULT });
  const logout = () => {
    dispatch({
      type: TUTOR_LOGOUT,
    });
  };

  const handleLogout = (e) => {
    e.preventDefault();
    updatePageCountToDefault();
    logout();
  };

  const loadTutor = async () => {
    if (localStorage.getItem("tutorToken")) {
      setAuthToken(localStorage.getItem("tutorToken"));
    }
    try {
      const res = await axios.get("/api/v1/tutor/me");
      dispatch({
        type: TUTOR_AUTH,
        payload: res.data,
      });
    } catch (error) {
      console.log(error, "errors");
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((error) => {
          alert(error.msg);
        });
      }
      dispatch({
        type: TUTOR_AUTH_FAILED,
      });
    }
  };

  useEffect(() => {
    loadTutor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {tutor !== null ? (
        <>
          <Col className="vertical-navbar__col" md="2" xs="2" sm="2" xl="2">
            <div className="vertical-navbar">
              <div className="tutorly-logo">
                <img alt="tuturly logo" src={Logo} />
              </div>
              <div className="logged-in-user__info">
                <div className="logged-in-user__image">
                  <img
                    src={tutor?.avatar}
                    alt="user avatar"
                    className="img-fluid"
                  />
                </div>
              </div>
              <p className="logged-in-user__school-name d-none-sm">
                course.tuturly
              </p>
              <div className="action-links mt-4">
                <Nav vertical>
                  <NavItem
                    className={classnames("navbar-item-link", {
                      selected: currentPage.counter === 1000,
                    })}
                  >
                    <NavLink
                      onClick={(e) => updatePage(1000)}
                      tag={Link}
                      to="/tutor/dashboard/home"
                    >
                      <i className="fas fa-home"></i>{" "}
                      <span className="navlink-text d-none-sm">Dashboard</span>
                    </NavLink>
                  </NavItem>

                  <NavItem
                    className={classnames("navbar-item-link", {
                      selected: currentPage.counter === 1001,
                    })}
                  >
                    <NavLink
                      onClick={(e) => updatePage(1001)}
                      tag={Link}
                      to="/tutor/dashboard/courses"
                    >
                      <i className="fas fa-book"></i>{" "}
                      <span className="navlink-text d-none-sm">My Courses</span>
                    </NavLink>
                  </NavItem>
                  <NavItem
                    className={classnames("navbar-item-link", {
                      selected: currentPage.counter === 1002,
                    })}
                  >
                    <NavLink
                      onClick={(e) => updatePage(1002)}
                      tag={Link}
                      to="/tutor/dashboard/products"
                    >
                      <i className="fas fa-list"></i>{" "}
                      <span className="navlink-text d-none-sm">
                        My Products
                      </span>
                    </NavLink>
                  </NavItem>

                  <NavItem
                    className={classnames("navbar-item-link", {
                      selected: currentPage.counter === 1003,
                    })}
                  >
                    <NavLink
                      onClick={(e) => updatePage(1003)}
                      tag={Link}
                      to="/tutor/dashboard/payment"
                    >
                      <i className="fas fa-dollar-sign"></i>
                      <span className="navlink-text d-none-sm">Payments</span>
                    </NavLink>
                  </NavItem>
                  <NavItem
                    className={classnames("navbar-item-link", {
                      selected: currentPage.counter === 1004,
                    })}
                  >
                    <NavLink
                      onClick={(e) => updatePage(1004)}
                      tag={Link}
                      to="/tutor/dashboard/notifications"
                    >
                      <i className="fas fa-bell"></i>{" "}
                      <span className="navlink-text d-none-sm">
                        Notifications
                      </span>
                    </NavLink>
                  </NavItem>
                </Nav>
              </div>
              <div className="user-settings">
                <div
                  onClick={(e) => updatePage(23)}
                  className={classnames("setting-option", {
                    "settings-link-selected": currentPage.counter === 23,
                  })}
                >
                  <Link to="/dashboard/settings">
                    <i className="fas fa-cog mr-3 settings-icon"></i> Settings
                  </Link>
                </div>
                <div id="tooltipbutton" className="more-options">
                  <i className="fas fa-ellipsis-v"></i>
                </div>
                <UncontrolledPopover placement="top" target="tooltipbutton">
                  <PopoverBody>
                    <Nav vertical>
                      <NavItem>
                        <NavLink className="link-text" href="#">
                          <i className="fas fa-info-circle"></i>{" "}
                          <span className="navlink-text">Help</span>
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className="link-text"
                          href="*"
                          onClick={(e) => handleLogout(e)}
                        >
                          <i className="fas fa-sign-out-alt"></i>{" "}
                          <span className="navlink-text">Logout</span>
                        </NavLink>
                      </NavItem>
                    </Nav>
                  </PopoverBody>
                </UncontrolledPopover>
              </div>
            </div>
          </Col>
        </>
      ) : (
        <DashboardLoadingSkeleton />
      )}
    </>
  );
};

const mapStateToProps = (state) => ({
  tutor: state.tutor.tutorDetails,
  currentPage: state.currentPage,
});

export default connect(mapStateToProps)(TutorDashboardNavbar);
