import React from 'react'
import { Link } from "react-router-dom"
import {
  UncontrolledCollapse,
  NavbarBrand,
  Navbar,
  Nav,
  Container,
  Row,
  Col
} from "reactstrap"

import tuturlyLogoSvg from "../../images/tuturlySvgLogo.svg"

import "../../custom-styles/layout/setuppagenavbar.css"

const SetupPageNavbar = () => {

    return <>
      <Navbar className="navbar-dark setup-page-navbar-style" expand="lg">
            <Container fluid style={{
              width: '80%'
            }}>
              <NavbarBrand tag={Link} to="/">
                <img src={tuturlyLogoSvg} alt="..." />
              </NavbarBrand>
              <button className="navbar-toggler" id="navbar-primary">
                <i className="fas fa-bars toggler-style"></i>
              </button>
              <UncontrolledCollapse navbar toggler="#navbar-primary">
                <div className="navbar-collapse-header">
                  <Row>
                    <Col className="collapse-brand" xs="6">
                      <Link to="/">
                      <img src={tuturlyLogoSvg} alt="..." />
                      </Link>
                    </Col>
                    <Col className="collapse-close" xs="6">
                      <button className="navbar-toggler" id="navbar-primary">
                        <span />
                        <span />
                      </button>
                    </Col>
                  </Row>
                </div>
                <Nav className="align-items-lg-center ml-lg-auto" navbar>
                  
                </Nav>
              </UncontrolledCollapse>
            </Container>
          </Navbar>
    </>
}

export default SetupPageNavbar