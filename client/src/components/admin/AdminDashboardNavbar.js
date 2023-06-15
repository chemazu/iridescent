import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Col, Nav, NavItem, NavLink } from "reactstrap";
import { loadUser, logout } from "../../actions/auth";
import { getDefaultSchool } from "../../actions/school";
import DashboardLoadingSkeleton from "../dashboard/DashboardLoadingSkeleton";

import logoImg from "../../images/tuturlySvgLogo.svg";

import "../../custom-styles/admin/dashboardlayout.css";

const AdminDashboardNavbar = ({
  school,
  user,
  logUserOut,
  getSchool,
  getLoggedInUser,
}) => {
  const handleLogout = (e) => {
    e.preventDefault();
    logUserOut();
  };

  useEffect(() => {
    getSchool();
    getLoggedInUser();
  }, [getSchool, getLoggedInUser]);

  return (
    <>
      {school.loading !== true &&
      school.schoolDetails !== null &&
      user !== null ? (
        <>
          <Col
            className="admin-vertical-navbar__col"
            md="2"
            xs="2"
            sm="2"
            xl="2"
          >
            <div className="admin-vertical-navbar">
              <div className="admin-tutorly-logo">
                <img alt="tuturly logo" className="img-fluid" src={logoImg} />
                <p>Admin</p>
              </div>
              <div className="admin-action-links mt-4">
                <Nav vertical>
                  <NavItem className="admin-navbar-item-link">
                    <NavLink tag={Link} to="/admin/dashboard">
                      <i className="fas fa-eye"></i>{" "}
                      <span className="navlink-text d-none-sm">Overview</span>
                    </NavLink>
                  </NavItem>
                  <NavItem className="admin-navbar-item-link">
                    <NavLink tag={Link} to="/admin/tutor">
                      <i className="fas fa-mug-hot"></i>{" "}
                      <span className="navlink-text d-none-sm">
                        Tutors List
                      </span>
                    </NavLink>
                  </NavItem>
                  <NavItem className="admin-navbar-item-link">
                    <NavLink tag={Link} to="/admin/report">
                      <i className="fas fa-exclamation-triangle"></i>{" "}
                      <span className="navlink-text d-none-sm">
                        Students Report
                      </span>
                    </NavLink>
                  </NavItem>
                  <NavItem className="admin-navbar-item-link">
                    <NavLink tag={Link} to="/admin/course">
                      <i className="fab fa-wpexplorer"></i>{" "}
                      <span className="navlink-text d-none-sm">
                        Explore Courses
                      </span>
                    </NavLink>
                  </NavItem>
                  <NavItem className="admin-navbar-item-link">
                    <NavLink tag={Link} to="/dashboard/index">
                      <i className="fas fa-step-backward"></i>{" "}
                      <span className="navlink-text d-none-sm">
                        Back To Tutor Space
                      </span>
                    </NavLink>
                  </NavItem>
                </Nav>
              </div>
              <div
                onClick={(e) => handleLogout(e)}
                className="admin-logout__btn"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>{" "}
                <span className="navlink-text ml-2">Logout</span>
              </div>
            </div>
          </Col>
        </>
      ) : (
        <>
          <DashboardLoadingSkeleton />
        </>
      )}
    </>
  );
};

const mapStateToProps = (state) => ({
  school: state.school,
  user: state.auth.user,
});

const mapDispatchToProps = (dispatch) => ({
  logUserOut: () => dispatch(logout()),
  getSchool: () => dispatch(getDefaultSchool()),
  getLoggedInUser: () => dispatch(loadUser()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminDashboardNavbar);
