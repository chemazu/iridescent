import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Form, FormGroup, Input, Button } from "reactstrap";
import { useAlert } from "react-alert";

import logo from "../../images/tuturlySVGHomeLogo.svg";
import tuturlyLogoSvg from "../../images/tuturlySvgLogo.svg";

import "../../custom-styles/prelander.css";

const Prelander = () => {
  const alert = useAlert();
  const [emailInput, setEmailInput] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  // / We need ref in this, because we are dealing
  // with JS setInterval to keep track of it and
  // stop it when needed
  const Ref = useRef(null);
  // The state for our timer
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const getTimeRemaining = (e) => {
    const total = e.getTime() - new Date().getTime();
    // Date.parse(e) - Date.parse(new Date()); // gets the total number of milliseconds between
    // the set date and our current date
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / 1000 / 60 / 60) % 24);
    const days = Math.floor(total / 86400000);
    return {
      total,
      hours,
      minutes,
      seconds,
      days,
    };
  };

  const startTimer = (e) => {
    let { total, hours, minutes, seconds, days } = getTimeRemaining(e);
    if (total >= 0) {
      // update the timer
      // check if less than 10 then we need to
      // add '0' at the beginning of the variable
      setDays(days);
      setHours(hours);
      setMinutes(minutes);
      setSeconds(seconds);
    }
  };

  const clearTimer = (e) => {
    // If you try to remove this line the
    // updating of timer Variable will be
    // after 1000ms or 1sec
    if (Ref.current) clearInterval(Ref.current);
    const id = setInterval(() => {
      startTimer(e);
    }, 1000);
    Ref.current = id;
  };

  const getDeadTime = () => {
    let deadline = new Date("09/26/2022");

    deadline.setHours(deadline.getHours() + 10);

    // This is where you need to adjust if
    // you entend to add more time
    // deadline.setSeconds(deadline.getSeconds() + 10);
    // deadline.setDate(deadline.getDate() + 50);
    return deadline;
  };

  // Another way to call the clearTimer() to start
  // the countdown is via action event from the
  // button first we create function to be called
  // by the button
  // const onClickReset = () => {
  //     clearTimer(getDeadTime());
  // }

  const handleTextInput = (e) => setEmailInput(e.target.value);

  const handleSubscribeSubmit = (e) => {
    e.preventDefault();
    if (submitLoading) return;
    submitNewSubscriber(emailInput);
  };

  const submitNewSubscriber = async (email) => {
    try {
      setSubmitLoading(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify({
        email: email,
      });
      await axios.post("/api/v1/prelaunch", body, config);
      setSubmitLoading(false);
      setEmailInput("");
      alert.show("Joined successfully", {
        type: "success",
      });
    } catch (error) {
      setSubmitLoading(false);
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((error) => {
          alert.show(error.msg, {
            type: "error",
          });
        });
      }
    }
  };

  // We can use useEffect so that when the component
  // mount the timer will start as soon as possible

  // We put empty array to act as componentDid
  // mount only
  useEffect(() => {
    clearTimer(getDeadTime());
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <section className="main-content__container">
        <div className="prelander-img-container">
          <img src={logo} alt="prelander logo" className="img-fluid" />
        </div>
        <div className="text-content__container">
          <h2 className="text-center">
            Earn Money Tutoring, <br />
            Impact Lives with Tuturly
          </h2>
          <h5 className="text-center">
            You and everyone from all works of life were <br />
            considered when creating Tuturly.
          </h5>
          <p className="launching-text text-center">
            We're officially launching in
          </p>
          <div className="timer-container">
            <div className="timer-indicator">
              <div className="timer-indicator-number">{days}</div>
              <div className="timer-indicator-text">days</div>
            </div>
            <div className="timer-indicator">
              <div className="timer-indicator-number">{hours}</div>
              <div className="timer-indicator-text">hours</div>
            </div>
            <div className="timer-indicator">
              <div className="timer-indicator-number">{minutes}</div>
              <div className="timer-indicator-text">minutes</div>
            </div>
            <div className="timer-indicator">
              <div className="timer-indicator-number">{seconds}</div>
              <div className="timer-indicator-text">seconds</div>
            </div>
          </div>

          <div className="offer-text">
            <p>We're offering:</p>
            <ul>
              <li>You own your customizable website.</li>
              <li>Protection from intellectual property theft.</li>
              <li>Course marketing.</li>
              <li>Easy withdrawals.</li>
            </ul>
          </div>
        </div>
      </section>
      <section className="call-to-action">
        <h3 className="text-center launch-cta">
          Join the waitlist and get a free signup upon our launch!
        </h3>
        <div className="form-call-to-action__container">
          <Form onSubmit={(e) => handleSubscribeSubmit(e)} className="mt-3">
            <FormGroup className="join-list-form-group">
              <Input
                value={emailInput}
                onChange={(e) => handleTextInput(e)}
                type="Email"
                placeholder="email"
                className="cta-input"
                required
              />
              <Button
                disabled={submitLoading}
                type="submit"
                className="btn-cta"
              >
                Join
                {submitLoading === true && (
                  <span className="btn-inner--icon ml-2">
                    <i className="fas fa-circle-notch fa-spin"></i>
                  </span>
                )}
              </Button>
            </FormGroup>
          </Form>
        </div>
      </section>
      <section className="social-links">
        <img src={tuturlyLogoSvg} alt="tuturly logo" className="img-fluid" />
        <div className="social-icons-container">
          <a
            href="https://www.instagram.com/tuturly/"
            target="_blanck"
            className="link-item"
          >
            <i className="fab fa-instagram"></i>
          </a>
          <a
            href="https://facebook.com/tuturlyNg"
            target="_blanck"
            className="link-item"
          >
            <i className="fab fa-facebook-f"></i>
          </a>
          <a
            href="https://twitter.com/tuturly"
            target="_blanck"
            className="link-item"
          >
            <i className="fab fa-twitter"></i>
          </a>
          {/* <a
            href="https://www.facebook.com"
            target="_blanck"
            className="link-item"
          >
            <i className="fab fa-youtube"></i>
          </a> */}
        </div>
      </section>
      <footer className="prelander-footer">
        <div className="prelander-footer__container">
          <img src={logo} alt="footer logo" className="img-fluid" />
          <p className="text-center">
            &copy; 2022 - Tuturly - All rights reserved
          </p>
        </div>
      </footer>
    </>
  );
};

export default Prelander;
