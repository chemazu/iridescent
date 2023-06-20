import React, { useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";

import { useParams, withRouter } from "react-router-dom";
import axios from "axios";

import Stream from "./Stream";
import setAuthToken from "../../../utilities/setAuthToken";

const PresenterValidation = ({ school }) => {
  const { roomid } = useParams();
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // get school name
  console.log(school);
  if (localStorage.getItem("tutorToken")) {
    console.log(localStorage.getItem("tutorToken"));
    setAuthToken(localStorage.getItem("tutorToken"));
  }

  const validateWebinar = async () => {
    setIsLoading(true);

    try {
      if (localStorage.getItem("tutorToken")) {
        console.log(localStorage.getItem("tutorToken"));
        setAuthToken(localStorage.getItem("tutorToken"));
      }
      let res = await axios.get(`/api/v1/livewebinar/stream/${roomid}`);
      if (res) {
        console.log(res);
        // if (res.data.school === school.schoolDetails.name) {
        setIsValid(true);
        setIsLoading(false);
        // }
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
    return <div>Loading...</div>;
  }

  if (!isValid) {
    return <div>Invalid Stream ID</div>;
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
