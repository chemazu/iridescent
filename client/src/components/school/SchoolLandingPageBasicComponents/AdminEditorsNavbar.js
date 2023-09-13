import React from "react";
import { Button, Container } from "reactstrap";

import "../../../custom-styles/schoollandingpagecomponents/admineditorsnavbar.css";

const AdminEditorsNavbar = ({
  togglePreviewMode,
  isPreviewMode,
  schoolname,
}) => {
  const handleGoBackToCustomizePage = () => {
    const host = window.location.host;
    if (host.includes("localhost")) {
      window.location.href = "http://localhost:3000/dashboard/customize";
    } else {
      window.location.href = "https://www.tuturly.com/dashboard/customize";
    }
  };

  return (
    <>
      <div className="admin-editors__navbar fixed-top">
        <Container
          fluid
          style={{
            width: "90%",
          }}
        >
          <div className="panel-control-contents">
            <div className="back-to-theme__select">
              <Button
                className="back-to-theme__select-button"
                onClick={handleGoBackToCustomizePage}
              >
                <i className="fas fa-arrow-left mr-3"></i>
                Back To Theme Select
              </Button>
            </div>

            <div className="preview-controller-container">
              <span className="mr-2">Edit Mode</span>
              <label className="switch">
                <input
                  type="checkbox"
                  value={isPreviewMode}
                  onChange={togglePreviewMode}
                />
                <span className="slider round"></span>
              </label>
              <span className="ml-2">Preview Mode</span>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};

export default AdminEditorsNavbar;
