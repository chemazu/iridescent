import React, { useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";

import { useParams, withRouter } from "react-router-dom";
import axios from "axios";

import Stream from "./Stream";
import setAuthToken from "../../../utilities/setAuthToken";
import { Spinner } from "reactstrap";
import InvalidStream from "./InvalidStream";

const PresenterValidation = ({ school }) => {
  const { roomid } = useParams();
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // get school name
  if (localStorage.getItem("tutorToken")) {
    setAuthToken(localStorage.getItem("tutorToken"));
  }

  const validateWebinar = async () => {
    setIsLoading(true);

    try {
      if (localStorage.getItem("tutorToken")) {
        setAuthToken(localStorage.getItem("tutorToken"));
      }
      let res = await axios.get(`/api/v1/livewebinar/stream/${roomid}`);
      if (res) {
        setIsValid(true);
          setIsLoading(false);
        if (res.data.timeLeft > 0) {
          if (res.data.school === school.schoolDetails.name) {
          setIsValid(true);
          setIsLoading(false);
        } else {
          setIsValid(false);
          setIsLoading(false);

        }
        }
      }
      // setIsLoading(false);
      // setIsValid(false);
    } catch (error) {
      console.log(error);
      setIsValid(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    validateWebinar();
  }, [roomid]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spinner />
      </div>
    );
  }

  if (!isValid) {
    return <InvalidStream/>;
  }
  return <Stream />;
};

const mapStateToProps = (state) => ({
  school: state.school,
  user: state.auth.user,
  currentPage: state.currentPage,
});

// export default PresenterValidation;
export default connect(mapStateToProps)(withRouter(PresenterValidation));
