import React from 'react'
import { Link } from 'react-router-dom'
import { 
    Button,
    UncontrolledCollapse,
    Navbar,
    NavItem,
    Nav,
    Container,
    Row,
    Col
} from "reactstrap"

export const HeroSetion = ({ themeData, school }) => {
    return <>
        <section style={{
              backgroundImage:`url(${themeData.themeimage})`,
              backgroundSize:'cover',
              backgroundRepeat:'no-repeat',
              backgroundAttachment:'fixed',
              backgroundPosition:'botto',
              width:'100%',
              height:'70vh'
            }} className="hero-section">
        <Navbar className="navbar-dark home-nav" expand="lg">
            <Container>
              <button className="navbar-toggler" id="navbar-primary">
                <i className="fas fa-bars hero-toggler-style"></i>
              </button>
              <UncontrolledCollapse navbar toggler="#navbar-primary">
                <div className="navbar-collapse-header">
                  <Row>
                    <Col className="collapse-brand" xs="6">
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
                      to={`/${school.name}/login`}
                      className="hero-section-button"
                    >
                      <span className="nav-link-inner--text ml-1">
                        login
                      </span>
                    </Button>
                  </NavItem>
                  <NavItem className="d-lg-block">
                    <Button
                      tag={Link}
                      to={`/${school.name}/enroll`}
                      className="hero-section-button"
                    >
                      <span className="nav-link-inner--text ml-1">
                        Enroll
                      </span>
                    </Button>
                  </NavItem>
                </Nav>
              </UncontrolledCollapse>
            </Container>
          </Navbar>

          <Container fluid className="hero-container-styles">
            <div className="hero-contents">
            <div className="hero-section-socail-links">
                     {
                       themeData.twitterurl !== undefined && (<a target="_blank" rel="noreferrer" href={`https://${themeData.twitterurl}`} className="social-icon-item">
                       <i className="fab fa-twitter"></i>
                       </a>)
                     }
                     {
                       themeData.youtubeurl !== undefined && (<a target="_blank" rel="noreferrer" href={`https://${themeData.youtubeurl}`} className="social-icon-item">
                       <i className="fab fa-youtube"></i>
                       </a>)
                     }
                    {
                      themeData.googleurl !== undefined && (<a target="_blank" rel="noreferrer" href={`https://${themeData.googleurl}`} className="social-icon-item">
                      <i class="fab fa-google"></i>
                     </a>)
                    }
                    {
                      themeData.instagramurl !== undefined && (<a target="_blank" rel="noreferrer" href={`https://${themeData.instagramurl}`} className="social-icon-item">
                      <i className="fab fa-instagram"></i>
                      </a>)
                    }
                   {
                     themeData.facebookurl !== undefined && ( <a target="_blank" rel="noreferrer" href={`https://${themeData.facebookurl}`} className="social-icon-item">
                     <i className="fab fa-facebook"></i>
                 </a>)
                   }
            </div>
            <div className="hero-section-school-info">
                <h1 className="school-name">{themeData.themeschoolname}</h1>
                <p className="school-subtitle">{themeData.themetitle}</p>
                <Button className="hero-btn-enroll">Enroll</Button>
            </div>
            </div>
          </Container>

        </section>
    </>
}

export default HeroSetion
