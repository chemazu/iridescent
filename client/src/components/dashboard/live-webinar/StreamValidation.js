import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import setAuthToken from "../../../utilities/setAuthToken";

import WatchStream from "./WatchStream";
import { loadUser } from "../../../actions/auth";
import { connect } from "react-redux";


 
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
  const [userName, setUserName] = useState(null);

  const getPayment = async () => {
    if (localStorage.getItem("studentToken")) {
      setAuthToken(localStorage.getItem("studentToken"));
    }
    try {
      if (localStorage.getItem("studentToken")) {
        setAuthToken(localStorage.getItem("studentToken"));
      }
 
      let res = await axios.get(`/api/v1/livewebinar/studentPayment/chemazu`);
      console.log(res.data);
      setUserName(res.data);
    } catch (error) {
      console.log(error);
      console.log(error.message);
    }
  };

  const validateWebinar = async () => {
    setIsLoading(true);
 
;

    try {
      let res = await axios.get(`/api/v1/livewebinar/watch/${roomid}`);
      console.log(userName)
      if (res) {
        if (res.data.school === schoolname) {
          console.log(res.data);
          setIsValid(true);
          setIsLoading(false);
        } else {
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

  useEffect(() => {
    getPayment();
  }, [roomid]);
  

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isValid) {
    return <div>Invalid Stream ID</div>;
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
