import React from "react";
import { Col, Nav, NavItem, NavLink } from "reactstrap";
import Skeleton from "react-loading-skeleton";

export const DashboardLoadingSkeleton = () => {
  return (
    <>
      <Col className="navigation-bar-skeleton" sm="2" md="2" xs="2" xl="2">
        <div className="vertical-navbar">
          <div className="tutorly-logo">
            <Skeleton />
          </div>
          <div className="logged-in-user__info mb-3">
            <Skeleton height={100} width={100} circle={true} />
          </div>
          <p className="logged-in-user__school-name d-none-sm">
            <Skeleton duration={2} height={10} width={200} />
          </p>
          <p className="logged-in-user__email d-none-sm">
            <Skeleton duration={2} height={10} width={200} />
          </p>
          <div className="action-links">
            <Nav vertical>
              <NavItem>
                <NavLink to="/dashboard/createcourse">
                  <Skeleton duration={2} height={30} />
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/dashboard/courses">
                  <Skeleton duration={2} height={30} />
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/dashboard/customize">
                  <Skeleton duration={2} height={30} />
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/dashboard/sales">
                  <Skeleton duration={2} height={30} />
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/dashboard/messages">
                  <Skeleton duration={2} height={30} />
                </NavLink>
              </NavItem>
            </Nav>
          </div>
        </div>
      </Col>
    </>
  );
};

export default DashboardLoadingSkeleton;
