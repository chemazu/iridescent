import React from "react";
import { Link } from "react-router-dom";

import notFoundImage from "../../images/404.png";

import "../../custom-styles/subdomainnotfoundpage.css";

const SubdomainNotFoundPage = ({ schoolName, school }) => {
  return (
    <>
      <div className="subdomain-not-found-page">
        <div className="subdomain-not-found-page__contents-container">
          <h3>404 Error</h3>
          {school === null && (
            <>
              <p>
                school with Name <span>"{schoolName}"</span> does not exist's on
                our platform
              </p>
            </>
          )}
          <p className="about-tuturly">
            Tuturly Give's you a platform to create and share your knowledge. On
            Tuturly you can also own an online school and share your Knowledge!.
          </p>
          <p>
            Click <a href="https://www.tuturly.com">Here</a> to get started.
          </p>
          <p>
            {school !== null && (
              <>
                <Link to="/"> Click go to School's Home Page.</Link>
              </>
            )}
          </p>
          <img src={notFoundImage} alt="..." />
        </div>
      </div>
    </>
  );
};

export default SubdomainNotFoundPage;
