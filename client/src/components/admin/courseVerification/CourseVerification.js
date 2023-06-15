import React, { useState } from "react";
import {
  Col,
  Container,
  Row,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";

import AdminDashboardNavbar from "../AdminDashboardNavbar";
import AdminNotificationNavbar from "../AdminNotificationNavbar";
import CourseVerificationRequest from "./CourseVerificationRequest";
import CourseVerificationVerified from "./CourseVerificationVerified";

import "../../../custom-styles/admin/courseverification.css";

const CourseVerification = () => {
  const [iconTabsSelect, updateIconTabsSelect] = useState({
    iconTabs: 1,
    plainTabs: 1,
  });

  const toggleNavs = (e, name, value) => {
    e.preventDefault();
    updateIconTabsSelect({
      ...iconTabsSelect,
      [name]: value,
    });
  };

  return (
    <div className="admin-dashboard-layout">
      <Container fluid>
        <Row>
          <AdminDashboardNavbar />
          <Col className="admin-page-actions__col">
            <div className="admin-page-actions">
              <AdminNotificationNavbar />
              <div className="admin-course-verification__container">
                <div className="admin-nav-wrapper">
                  <Nav
                    className="nav-fill flex-column flex-md-row"
                    id="tabs-icons-text"
                    pills
                    role="tablist"
                  >
                    <NavItem>
                      <NavLink
                        aria-selected={iconTabsSelect.iconTabs === 1}
                        className={`mb-sm-3 mb-md-0 ${
                          iconTabsSelect.iconTabs === 1 && "active"
                        }`}
                        onClick={(e) => toggleNavs(e, "iconTabs", 1)}
                        role="tab"
                      >
                        New Request
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        aria-selected={iconTabsSelect.iconTabs === 2}
                        className={`mb-sm-3 mb-md-0 ${
                          iconTabsSelect.iconTabs === 2 && "active"
                        }`}
                        onClick={(e) => toggleNavs(e, "iconTabs", 2)}
                        role="tab"
                      >
                        Verified Courses
                      </NavLink>
                    </NavItem>
                  </Nav>
                </div>
                <div className="tab-contents mt-4">
                  <TabContent activeTab={"iconTabs" + iconTabsSelect.iconTabs}>
                    <TabPane tabId="iconTabs1">
                      {iconTabsSelect.iconTabs === 1 && (
                        <>
                          <CourseVerificationRequest />
                        </>
                      )}
                    </TabPane>
                    <TabPane tabId="iconTabs2">
                      {iconTabsSelect.iconTabs === 2 && (
                        <>
                          <CourseVerificationVerified />
                        </>
                      )}
                    </TabPane>
                  </TabContent>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CourseVerification;
