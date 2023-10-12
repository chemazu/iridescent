import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import setAuthToken from "../../../utilities/setAuthToken";

import WatchStream from "./WatchStream";
import { loadUser } from "../../../actions/auth";
import { connect } from "react-redux";
import { Spinner } from "reactstrap";
import InvalidStream from "./InvalidStream";
/* eslint-disable react-hooks/exhaustive-deps */

if (localStorage.getItem("studentToken")) {
  setAuthToken(localStorage.getItem("studentToken"));
}

const StreamValidation = ({ schoolname, user, getLoggedInUser }) => {
  if (localStorage.getItem("studentToken")) {
    setAuthToken(localStorage.getItem("studentToken"));
  }
  const { roomid } = useParams();
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [webinarTimeOut, setWebinarTimeOut] = useState(false);

  const validateWebinar = async () => {
    setIsLoading(true);

    try {
      let res = await axios.get(`/api/v1/livewebinar/watch/${roomid}`);

      if (res) {
        if (res.data.school === schoolname && res.data.timeLeft > 0) {
          // if (res.data.school === schoolname) {

          setIsValid(true);
          setIsLoading(false);
        }
        if (res.data.school === schoolname && res.data.timeLeft <= 0) {
          setWebinarTimeOut(true);
          setIsValid(true);
          setIsLoading(false);
        } else {
          // setIsValid(false);

          setIsLoading(false);
        }
      }
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
  if (webinarTimeOut) {
    return <>timed out</>;
    // return <WatchStream />;
  }
  if (!isValid) {
    return <InvalidStream />;
    // return <WatchStream />;
  }

  return <WatchStream />;
};

const mapStateToProps = (state) => ({
  user: state.auth.user,
  userAuthenticated: state.auth.authenticated,
  schoolname: state.subdomain,
});
const mapDispatchToProps = (dispatch) => ({
  getLoggedInUser: () => dispatch(loadUser()),
});

export default connect(mapStateToProps, mapDispatchToProps)(StreamValidation);
