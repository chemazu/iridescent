import React, { useEffect, useState } from 'react';

const CountdownTimer = ({ endTime, firstReminder, classOver }) => {
  const [timeLeft, setTimeLeft] = useState(endTime - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft = endTime - Date.now();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft <= 0 * 60 * 1000) {

        console.log("fish")
        classOver();

      } else if (newTimeLeft === 10 * 60 * 1000) {
        firstReminder();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [endTime, firstReminder, classOver]);

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000) % 60;
    const minutes = Math.floor(milliseconds / 1000 / 60) % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <p>{formatTime(timeLeft)}</p>
    </div>
  );
};

export default CountdownTimer;
