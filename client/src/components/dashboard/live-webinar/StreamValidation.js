import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import WatchStream from "./WatchStream";

const StreamValidation = () => {
  const { roomid } = useParams();
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const validateWebinar = async () => {
    setIsLoading(true);

    try {
      let res = await axios.get(`/api/v1/livewebinar/watch/${roomid}`);
      if (res) {
        setIsValid(true);
        setIsLoading(false);
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
    return <div>Loading...</div>;
  }

  if (!isValid) {
    return <div>Invalid Stream ID</div>;
  }

  return <WatchStream />;
};

export default StreamValidation;
