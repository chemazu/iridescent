import React from "react";
import { Container } from "reactstrap";

import "../../../custom-styles/schoollandingpagecomponents/footer.css";

const Footer = ({ theme, schoolName, schoolUser, enterprisePlan }) => {
  return (
    <>
      <section
        style={{
          backgroundColor: theme.themestyles.footerbackgroundcolor,
        }}
      >
        {enterprisePlan !== schoolUser.selectedplan._id && (
          <>
            <div className="site-builder-info">
              <p
                style={{
                  color: theme.themestyles.footertextcolor,
                  fontFamily: theme.themestyles.fontfamily,
                }}
                className="text-center lead"
              >
                This Site was made with Tuturly Page Builder.
              </p>
            </div>
          </>
        )}
        <Container fluid>
          <p
            style={{
              color: theme.themestyles.footertextcolor,
              fontFamily: theme.themestyles.fontfamily,
            }}
            className="text-center school-footer-text__style"
          >
            Copyright &copy; {new Date().getFullYear()} - {schoolName}
          </p>
        </Container>
      </section>
    </>
  );
};

export default Footer;
