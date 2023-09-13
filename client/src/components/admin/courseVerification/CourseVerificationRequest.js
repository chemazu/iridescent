import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAlert } from "react-alert";
import setAuthToken from "../../../utilities/setAuthToken";
import CourseVerificationRequestItem from "./CourseVerificationRequestItem";

const CourseVerificationRequest = () => {
  const [verificationRequest, setVerificationRequest] = useState([]);
  const [loading, setLoading] = useState(true);
  const alert = useAlert();

  const getVerificationRequest = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const res = await axios.get(
        "/api/v1/courseverification/status/unverified"
      );
      setVerificationRequest(res.data);
      setLoading(false);
    } catch (error) {
      setVerificationRequest([]);
      setLoading(false);
      const errors = error.response.data.errors;
      if (errors) {
        return errors.forEach((element) => {
          alert.show(element.msg, {
            type: "error",
          });
        });
      }
      alert.show(error.message, { type: "error" });
    }
  };

  useEffect(() => {
    getVerificationRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="course-verification-request__container">
        {loading === true ? (
          <div
            style={{
              width: "50%",
              margin: "20px auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <i
              style={{ fontSize: "22px" }}
              className="fas fa-circle-notch fa-spin"
            ></i>
          </div>
        ) : (
          <>
            {verificationRequest.length === 0 ? (
              <p className="text-center mt-3">No Request Found!</p>
            ) : (
              <>
                {verificationRequest.map((verificationItem) => (
                  <CourseVerificationRequestItem
                    key={verificationItem._id}
                    verificationItem={verificationItem}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default CourseVerificationRequest;
