import React, { useState, useEffect } from "react";

export default function SecondaryTimer({ endTime, tenMins, endStream }) {
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());

  // const { newEndTime, tenMins, endStream } = props;
  const now = Date.now();
  const newTime = now + 45 * 60 * 1000;
  let newEndTime = endTime || newTime;
  useEffect(() => {
    const timer = setInterval(() => {
      const updatedTimeRemaining = calculateTimeRemaining();
      setTimeRemaining(updatedTimeRemaining);

      // Check if there are 10 minutes left and timer reaches 0
      if (
        updatedTimeRemaining.minutes === 10 &&
        updatedTimeRemaining.seconds === 0
      ) {
        tenMins();
      }

      // Check if timer reaches 0
      if (
        updatedTimeRemaining.minutes === 0 &&
        updatedTimeRemaining.seconds === 0
      ) {
        endStream();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function calculateTimeRemaining() {
    const currentTime = new Date().getTime();
    const difference = newEndTime - currentTime;

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
    };
  }

  function formatNumber(number) {
    return number.toString().padStart(2, "0");
  }

  return (
    <div>
      <span>
        {formatNumber(timeRemaining.minutes)} :{" "}
        {formatNumber(timeRemaining.seconds)}
      </span>
    </div>
  );
}
