import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useParams, withRouter } from "react-router-dom";
import axios from "axios";
import { Spinner } from "reactstrap";
import InvalidStream from "./InvalidStream";
import Stream from "./Stream";
import setAuthToken from "../../../utilities/setAuthToken";
import TimedOutClass from "./TimedOutClass";

const PresenterValidation = ({ school }) => {
  const { roomid } = useParams();
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeout, setTimeout] = useState(false);
  const [schoolInfo, setSchoolInfo] = useState(null);

  // get school name
  useEffect(() => {
    const validateWebinar = async () => {
      setIsLoading(true);
      let now = Date.now();

      try {
        if (localStorage.getItem("tutorToken")) {
          setAuthToken(localStorage.getItem("tutorToken"));
        }
        let res = await axios.get(`/api/v1/livewebinar/validate/${roomid}`);

        if (res) {
          setSchoolInfo(res.data);

          if (!res.data.endStatus) {
            if (res.data.classEndTime > now || res.data.classEndTime === 0) {
              // localStorage.setItem(`${roomid}`, `${res.data.classEndTime}`);
              setIsValid(true);
              setIsLoading(false);
            } else {
              setTimeout(true);
              setIsLoading(false);
            }
          } else {
          }
          // classEndTime
          // endStatus
          // setIsValid(true);
          // setIsLoading(false);
          // if (res.data.timeLeft > 0) {

          // } else {
          //   setTimeout(true);
          // }
        }
      } catch (error) {
        console.log(error);
        setIsValid(false);
        setIsLoading(false);
      }
    };

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

  if (timeout) {
    return <TimedOutClass schoolInfo={schoolInfo} />;
    // return <Stream />;
  }

  if (!isValid) {
    return <InvalidStream />;
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
