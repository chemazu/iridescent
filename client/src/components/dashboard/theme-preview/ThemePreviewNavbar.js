import React from 'react'
import { Link } from 'react-router-dom'
import { Navbar, NavbarBrand,
  Container, Row, Col,
  Nav, NavItem, UncontrolledCollapse, Button
} from 'reactstrap'

import Logo from "../../../images/payment-modal-tuturly-logo.png"

import '../../../custom-styles/dashboard/themepreview/themepreviewnavbar.css'

const ThemePreveiwNavbar = ({
   theme,
   previewId
  }) => {
  return <>
      <div className="school-dafault-navbar">
        <Navbar 
          style={{
            backgroundColor: theme?.themedefaultstyles.navbarbackgroundcolor,
          }}
         expand="lg">
            <Container fluid style={{ width:'90%'}}>
              <NavbarBrand tag={Link} 
               to="/dashboard/customize"
              >
               <img src={Logo} style={{
                 
                }} alt='...' className="img-fluid" />
               </NavbarBrand>
              <button className="navbar-toggler" id="navbar-primary">
                <i style={{
                  color: theme?.themedefaultstyles.navbartextcolor,
                }} className="fas fa-bars toggler-style"></i>
              </button>
              <UncontrolledCollapse navbar toggler="#navbar-primary">
                <div className="navbar-collapse-header">
                  <Row>
                    <Col className="collapse-brand" xs="6">
                    <NavbarBrand tag={Link}
                    to="/dashboard/customize"
                    >
                      <img src={Logo} style={{
                          
                        }} alt='...' className="img-fluid" />
                    </NavbarBrand>
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
                <NavItem className="d-lg-block">
                    <Button
                      tag={Link}
                      to={`/dashboard/customize/theme/preview/${previewId}`}
                      className="school-navbar-btn"
                      style={{
                        color: theme?.themedefaultstyles.navbartextcolor,
                        backgroundColor: theme?.themedefaultstyles.navbarbackgroundcolor,
                        fontFamily: theme?.themedefaultstyles.fontfamily,
                        boxShadow:'none',
                        border:'none',
                        transform:'none'
                      }}
                    > 
                      <span className="nav-link-inner--text ml-1">
                        Enroll
                      </span>
                    </Button>
                  </NavItem>
                  <NavItem className="d-lg-block">
                    <Button
                      tag={Link}
                      to={`/dashboard/customize/theme/preview/${previewId}`}
                      className="school-navbar-btn"
                      style={{
                        color: theme?.themedefaultstyles.navbartextcolor,
                        backgroundColor: theme?.themedefaultstyles.navbarbackgroundcolor,
                        fontFamily: theme?.themedefaultstyles.fontfamily,
                        boxShadow:'none',
                        border:'none',
                        transform:'none'
                      }}
                    >
                      <span className="nav-link-inner--text ml-1">
                        Login
                      </span>
                    </Button>
                  </NavItem>
                  <NavItem className="d-lg-block">
                    <Button
                      tag={Link}
                      to={`/dashboard/customize/theme/preview/${previewId}`}
                      className="school-navbar-btn"
                      style={{
                        color: theme?.themedefaultstyles.navbartextcolor,
                        backgroundColor: theme?.themedefaultstyles.navbarbackgroundcolor,
                        fontFamily: theme?.themedefaultstyles.fontfamily,
                        boxShadow:'none',
                        border:'none',
                        transform:'none'
                      }}
                    >
                      <span className="nav-link-inner--text ml-1">
                        View Cart
                      </span>
                    </Button>
                  </NavItem>
                </Nav>
              </UncontrolledCollapse>
            </Container>
          </Navbar>
</div>
  </>
}

export default ThemePreveiwNavbar
