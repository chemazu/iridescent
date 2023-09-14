import React from "react";
import { connect } from "react-redux";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { Col, Button } from "reactstrap";

export const ThemeItem = ({
  themepreviewItem,
  openThemeChangeModal,
  school,
}) => {
  const showChangeThemeConfirmationDialog = (themepreviewId) => {
    openThemeChangeModal(themepreviewId);
  };

  const setTokenAsCookie = (tokenData) => {
    const host = window.location.host;
    const baseDomain = host.includes("localhost")
      ? ".localhost:3000"
      : `.${host.split(".")[1]}.com`;
    Cookies.set("adminCookie", tokenData, {
      expires: 4,
      secure: false,
      domain: baseDomain,
    });
  };

  const getSchoolUrl = (schoolname) => {
    const host = window.location.host;
    if (host.includes("localhost")) {
      return `http://${schoolname}.${host}`;
    }
    const baseDomain = host.split(".")[1];
    return baseDomain.includes("localhost")
      ? `http://${schoolname}.${baseDomain}`
      : `https://${schoolname}.${baseDomain}.com`;
  };

  const handleVisitSchoolClickHandler = () => {
    setTokenAsCookie(localStorage.getItem("token"));
    window.open(getSchoolUrl(school.name), "_blank");
  };

  return (
    <>
      <Col className="mb-3" xs="12" sm="12" md="6" lg="4">
        <div className="theme-preview-item">
          <div className="theme-preview-overlay">
            {themepreviewItem?._id === school?.themepreviewid ? (
              <>
                <Button
                  onClick={handleVisitSchoolClickHandler}
                  size="large"
                  className="ml-3 mt-3"
                >
                  Visit School Page
                </Button>
                <Button
                  size="large"
                  className="ml-3 mt-3"
                  tag={Link}
                  to="/dashboard/customize/theme/setup/themeinfo"
                >
                  Update Settings
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="large"
                  className="ml-3 mt-3"
                  tag={Link}
                  to={`/dashboard/customize/theme/preview/${themepreviewItem?._id}`}
                >
                  Preview Theme
                </Button>
                <Button
                  size="large"
                  className="ml-3 mt-3"
                  onClick={(e) =>
                    showChangeThemeConfirmationDialog(themepreviewItem?._id)
                  }
                >
                  choose Theme
                </Button>
              </>
            )}
          </div>
          <div className="theme-thumbnail-container">
            <img
              className="theme-previewer"
              src={themepreviewItem?.thumbnail}
              alt="theme-previewer"
            />
          </div>
        </div>
        {themepreviewItem?._id === school?.themepreviewid && (
          <p className="small text-center active-theme-indicator-text">
            Active Theme
          </p>
        )}
      </Col>
    </>
  );
};

const mapStateToProps = (state) => ({
  school: state.school.schoolDetails,
});

export default connect(mapStateToProps)(ThemeItem);
