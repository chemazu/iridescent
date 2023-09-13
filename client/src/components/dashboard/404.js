import React from "react";
import { Link } from "react-router-dom";

import notFoundImage from "../../images/404.png";

import "../../custom-styles/notfoundpage.css";

const NotFoundPage = () => {
  return (
    <>
      <div className="not-found-page">
        <div className="not-found-page__contents-container">
          <h3>404 Error</h3>
          <p>Page not Found</p>
          <p>
            Click <Link to="/">Here</Link> to go to Home Page.
          </p>
          <img src={notFoundImage} alt="..." />
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
