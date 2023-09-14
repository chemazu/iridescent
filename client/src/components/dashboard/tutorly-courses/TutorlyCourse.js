import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAlert } from "react-alert";
import CoursesNavbar from "./NavBar";
import { Link } from "react-router-dom";
import ctaImage from "../../../images/tutorly-courses-cta-image.svg";
import { Button } from "reactstrap";
import tuturlyCoursesLogo from "../../../images/tuturly-courses-logo.svg";
import Footer from "../../home/Footer";
import { CarouselItem } from "../../../components/carousel/useCarousel";
import { Col } from "reactstrap";

// Import css files
import "../../../custom-styles/dashboard/tuturly-courses/tutorly-course.css";

export default function TutorlyCourse() {
  const [products, setProducts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const alert = useAlert();

  const getLandingPageProducts = async () => {
    try {
      const res = await axios.get(`/api/v1/tutor/products/courses`);
      setProducts(res.data);
    } catch (error) {
      console.log(error);
      setProducts([]);
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((element) => {
          alert.show(element.msg, {
            type: "error",
          });
        });
      }
    }
  };

  const getLandingPageCourses = async () => {
    try {
      const res = await axios.get(`/api/v1/tutor/courses/courses`);
      setCourses(res.data);
    } catch (error) {
      console.log(error);
      setCourses([]);
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((element) => {
          alert.show(element.msg, {
            type: "error",
          });
        });
      }
    }
  };

  const getLandingPageContents = async () => {
    setLoading(true);
    await Promise.all([getLandingPageProducts(), getLandingPageCourses()]);
    setLoading(false);
  };

  useEffect(() => {
    getLandingPageContents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="tutorly-course">
      <CoursesNavbar />
      <header className="tutorly-course-header">
        <div className="text-container">
          <h1 className="heading">
            LOOKING TO START A NEW CAREER PATH OR ADVANCE YOUR SKILLS
          </h1>
          <p className="header-features">You are at the right place.</p>
          <Button
            size="lg"
            type="button"
            className="ml-1 mb-3 sign-up-btn"
            tag={Link}
            to="/#"
          >
            Enroll
          </Button>
        </div>
        <div className="img-wrapper"></div>
      </header>
      <div className="tuturly-benefits">
        <h3>Benefits of enrolling to Tuturly Courses</h3>
        <p>Here is how we are positioned to help you win</p>
        <div className="benefit-wrapper">
          <div className="benefit-card">
            <div className="benefit-img b-one"></div>
            <div className="benefit-content">
              <h4>Your success matters to us</h4>
              <p>
                We love to see you win, that’s why we ensure that you get not
                just learning but support throughout your learning journey.
              </p>
            </div>
          </div>{" "}
          <div className="benefit-card">
            <div className="benefit-img b-two"></div>
            <div className="benefit-content">
              <h4>More than just learning</h4>
              <p>
                Get access to a wide range of resources to help you navigate
                your career journey.
              </p>
            </div>
          </div>{" "}
          <div className="benefit-card">
            <div className="benefit-img b-three"></div>
            <div className="benefit-content">
              <h4>Learn at your own pace</h4>
              <p>Courses and resources are available to you for life.</p>
            </div>
          </div>
        </div>
      </div>
      <section className="tutorly-categories">
        <h3>Here’s a List of Tuturly’s course categories</h3>
        <div className="categories-row-wrapper">
          <div className="categories-row">
            <span>BLOCK CHAIN</span>
            <span>BUSINESS ANALYSIS</span>
            <span>CODING</span>
            <span>COPYWRITING</span>
          </div>
          <div className="categories-row">
            <span>CYBER SECURITY</span>
            <span>DATA ANALYSIS</span>
            <span>DIGITAL MARKETING</span>
            <span>GRAPHIC DESIGN</span>
          </div>
          <div className="categories-row">
            <span>FOREX TRADING</span>
            <span>IMPORTATION</span>
            <span>VIDEO EDITING</span>
            <span>VIRTUAL ASSISTANT</span>
          </div>
        </div>
      </section>
      <section className="tutorly-cta">
        <div className="text-content">
          <img
            src={tuturlyCoursesLogo}
            alt="tuturly courses"
            style={{ marginBottom: "20px" }}
          />
          <h4>
            Increase your knowledge join our professional team at Tuturly.
          </h4>
          <ul>
            <li> Choose from different categories and walks of life.</li>
            <li>Learn at your own pace.</li>
            <li>Get certificates in Tech, Art and Business.</li>
          </ul>
        </div>
        <img
          src={ctaImage}
          alt="Increase your knowledge Join our Professional team at Tuturly."
        />
      </section>
      <section className="tutorly-product-list">
        <h4>Tuturly's Course list</h4>
        <div className="tutorly-products">
          {loading === true ? (
            <p className="text-center">loading...</p>
          ) : (
            <>
              {courses.length === 0 ? (
                <p className="text-center">courses not found</p>
              ) : (
                <>
                  {courses.map((course, index) => {
                    console.log(course);
                    return (
                      <CarouselItem key={index}>
                        <Col className="mb-3," xs="12" sm="6" md="6" xl="12">
                          <div className="tuturly-course-item">
                            <div className="tuturly-course-item-img">
                              <Link to={`course/preview/${course._id}`}>
                                <img
                                  className="img-fluid"
                                  src={course.thumbnail}
                                  alt="..."
                                  // style={{ height: "80%" }}
                                />
                              </Link>
                            </div>
                            <div className="tuturly-course-item-content">
                              <div
                                title={course.title}
                                className="author-course-item-title"
                              >
                                <Link to={`course/preview/${course._id}`}>
                                  {course.title}
                                </Link>
                                <div className="container">
                                  <div className="dots"></div>
                                  <div className="dots"></div>
                                  <div className="dots"></div>
                                </div>
                              </div>
                              <p
                                className="author-course-item-author-info"
                                style={{ textTransform: "capitalize" }}
                              >
                                {`${course.tutor.firstname} ${course.tutor.lastname}`}
                              </p>
                              <p className="tuturly-course-level">
                                {course.level}
                              </p>
                              <p className="author-course-card-price">
                                &#8358;{course.price}
                              </p>
                            </div>
                          </div>
                        </Col>
                      </CarouselItem>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>
      </section>
      <section className="tutorly-product-list">
        <h4>Tuturly's Product list.</h4>
        <div className="tutorly-products">
          {loading === true ? (
            <p className="text-center">loading...</p>
          ) : (
            <>
              {products.length === 0 ? (
                <p className="text-center">Products not found</p>
              ) : (
                <>
                  {products.map((product) => (
                    <Col className="mb-3," xs="12" sm="6" md="6" xl="3">
                      <div className="tuturly-course-item">
                        <div className="tuturly-course-item-img">
                          <Link to={`product/preview/${product._id}`}>
                            <img
                              className="img-fluid"
                              src={product.thumbnail}
                              alt="..."
                              // style={{ height: "80%" }}
                            />
                          </Link>
                        </div>
                        <div className="tuturly-product-item__info">
                          <div
                            title={product.title}
                            className="product-item-info__title"
                          >
                            <Link to={`/dashboard/product/${product._id}`}>
                              {product.title}
                            </Link>
                          </div>
                          <div className="product-item-info__type">
                            <span>{product.file_type.substring(1)}</span> file
                          </div>
                          <p className="product-item-author__info">
                            {`${product.author.firstname} ${product.author.lastname}`}
                          </p>
                          <p className="product-item-price">
                            &#8358;{product.price}
                          </p>
                        </div>
                      </div>
                    </Col>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </section>
      <section className="tutorly-students">
        <div className="tutorly-students-card">
          <div className="tutorly-students-card-img one"></div>
          <div className="tutorly-students-card-content">
            <h4>Learn from the best</h4>
            <p>
              Our tutors’ experience and expertise is just what you need to
              succeed on your career journey. You are taking this journey with
              guidance from experienced professionals, be rest assured of
              premium learning experience.
            </p>
          </div>
        </div>
        <div className="tutorly-students-card">
          <div className="tutorly-students-card-img two"></div>
          <div className="tutorly-students-card-content">
            <h4>Accessible and available</h4>
            <p>
              Our tutors’ experience and expertise is just what you need to
              succeed on your career journey. You are taking this journey with
              guidance from experienced professionals, be rest assured of
              premium learning experience.
            </p>
          </div>
        </div>
      </section>
      {/* <section className="tutorly-benefits">
        <h3> Benefits of Enrollment </h3>
        <p>
          Access to quality knowledge and to our awesome upcoming lectures and
          features.
        </p>
      </section>
      <section className="tutorly-contact-us">
        <h3>Contact Us </h3>
        <p>
          94602 San Pablo Avenue, Oakland Califonia <br />
          Phone no:xxx xxxx xxxxx
        </p>
        <div className="logo-wrapper">
          <img src={facebook} alt="facebook" />
          <img src={twitter} alt="twitter" />
          <img src={youtube} alt="youtube" />
          <img src={instagram} alt="instagram" />
          <img src={google} alt="google" />
        </div>
      </section> */}
      <Footer />
    </div>
  );
}
