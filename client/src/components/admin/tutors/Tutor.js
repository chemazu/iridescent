import React from "react";
import { Col, Container, Row } from "reactstrap";

import AdminDashboardNavbar from "../AdminDashboardNavbar";
import AdminNotificationNavbar from "../AdminNotificationNavbar";

const Tutors = () => {
  return (
    <div className="admin-dashboard-layout">
      <Container fluid>
        <Row>
          <AdminDashboardNavbar />
          <Col className="admin-page-actions__col">
            <div className="admin-page-actions">
              <AdminNotificationNavbar />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Tutors;
