import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Col, Container, Row } from "reactstrap";
import { UPDATE_DASHBOARD_PAGE_COUNTER } from "../../../../../actions/types";
import TutorDashboardNavbar from "../TutorDashboardNavbar";
import TutorNotificationNavbar from "../TutorNotificationNavbar";

import "../../../../../custom-styles/dashboard/dashboardlayout.css";

const Courses = () => {
  const dispatch = useDispatch();

  const updatePage = (index) => {
    dispatch({ type: UPDATE_DASHBOARD_PAGE_COUNTER, payload: index });
  };

  useEffect(() => {
    updatePage(1001);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="dashboard-layout">
      <Container fluid>
        <Row>
          <TutorDashboardNavbar />
          <Col className="page-actions__col">
            <div className="page-actions">
              <TutorNotificationNavbar />
              <div className="indexPagecontentshere">
                Courses Page Contents...
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Courses;
