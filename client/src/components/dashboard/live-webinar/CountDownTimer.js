import React, { useState, useEffect } from "react";

const CountdownTimer = ({ duration, onCompletion, style }) => {
  // const [timeLeft, setTimeLeft] = useState(duration);

  // useEffect(() => {
  //   if (timeLeft === 0) {
  //     onCompletion();
  //     return;
  //   }

  //   const timer = setInterval(() => {
  //     setTimeLeft((prevTime) => prevTime - 1);
  //   }, 1000);

  //   return () => {
  //     clearInterval(timer);
  //   };
  // }, [timeLeft, onCompletion]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div>
      <span style={style}>{formatTime(duration)}</span>
    </div>
  );
};

export default CountdownTimer;
