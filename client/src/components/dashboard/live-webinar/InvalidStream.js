// import React from "react";

// export default function InvalidStream() {
//   return <div>

//     <h2>InvalidStream</h2>
//     <p>Kindly confirm the url and try again </p>
//   </div>;
// }

import React from "react";
import { Link } from "react-router-dom";

import notFoundImage from "../../../images/404.png";

// import "../../custom-styles/subdomainnotfoundpage.css";
import "../../../custom-styles/subdomainnotfoundpage.css";

const InvalidStream = ({ schoolName, school }) => {
  return (
    <>
      <div className="subdomain-not-found-page">
        <div className="subdomain-not-found-page__contents-container">
          <h3>Invalid Stream ID</h3>
          {school === null && (
            <>
              <p>
                school with Name <span>"{schoolName}"</span> does not exist's on
                our platform
              </p>
            </>
          )}
         
          <p className="about-tuturly">Kindly confirm the url and try again </p>

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

export default InvalidStream;
