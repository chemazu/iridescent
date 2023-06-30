import React, { useEffect, useState } from "react";
import axios from "axios";
import { useStore } from "react-redux";
import "../../../custom-styles/schoollandingpagecomponents/livewebinarsectionstyles.css";
import { Button } from "reactstrap";
import { Link } from "react-router-dom";
import setAuthToken from "../../../utilities/setAuthToken";

export default function LiveWebinarSection({ schoolname, theme }) {
  const [userStreams, setUserStreams] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMore, setViewMore] = useState(false);
  const [purchasedWebinar, setPurchasedWebinar] = useState([]);

  const [purchasedWebinarLoading, setPurchasedWebinarLoading] = useState(true);
  const [currentItem, setCurrentItem] = useState(0);
  const store = useStore();
  const appState = store.getState();

  const { cart, student } = appState;
  const notificationState = appState.studentNotification;
  const { authenticated } = student;

  let themeData = theme;
  let backendSectionData = { isusingsecondarystyles: true };
  const getPurchasedWebinars = async () => {
    try {
      if (localStorage.getItem("studentToken")) {
        setAuthToken(localStorage.getItem("studentToken"));
      }
      const res = await axios.get(`/api/v1/studentwebinar/${schoolname}`);
      setPurchasedWebinar(res.data);
      setPurchasedWebinarLoading(false);
    } catch (error) {
      // eslint-disable-next-line
      if (error.response.status == "400") {
        const errors = error.response.data.errors;
        errors.forEach((err) => {
          alert.show(err.msg, {
            type: "error",
          });
        });
      }
    }
  };
  const getWebinars = async () => {
    setLoading(true);

    let res = await axios.get(
      `/api/v1/livewebinar/schoolstreams/${schoolname}`
    );
    setUserStreams(res.data.streams);
    setLoading(false);
  };
  const confirmPayment = (idToCheck) => {
    let itemFound = false;
    for (let i = 0; i < purchasedWebinar.length; i++) {
      if (purchasedWebinar[i].webinarBought._id === idToCheck) {
        itemFound = true;
        break;
      }
    }

    return itemFound;
  };
  const today = new Date();
  const startOfWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - today.getDay()
  );
  const endOfWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - today.getDay() + 6
  );

  const streams = userStreams?.filter((stream) => {
    const streamDate = new Date(stream.startTime);
    return streamDate >= startOfWeek && streamDate <= endOfWeek;
  });
  function handleTimeDisplay(time) {
    const timestamp = new Date(time);
    const dateStr = timestamp.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
    });
    const timeStr = timestamp.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
    });

    const parts = dateStr.split(" ");
    const month = parts[0].toUpperCase();
    const day = parts[1];

    const convertedStr = `${timeStr} ${month} ${day}`;
    return convertedStr;
  }
  useEffect(() => {
    getWebinars();
  }, []);
  useEffect(() => {
    getPurchasedWebinars();
  });
  return (
    <>
      {" "}
      {streams?.length > 0 && (
        <section
          style={{
            backgroundColor:
              backendSectionData.isusingsecondarystyles === true
                ? themeData.themestyles.secondarybackgroundcolor
                : themeData.themestyles.primarybackgroundcolor,
            paddingBottom: "2rem",
          }}
          className="school-product-list"
        >
          <div className="school-live-webinar">
            <h3
              className="header"
              style={{
                color:
                  backendSectionData.isusingsecondarystyles === true
                    ? themeData.themestyles.secondarytextcolor
                    : themeData.themestyles.primarytextcolor,
                fontFamily: themeData.themestyles.fontfamily,
                paddingBottom: "1rem",
              }}
            >
              Upcoming Webinar
            </h3>{" "}
            {streams?.map((item, index, arr) => {
              return (
                index === currentItem && (
                  <div className="school-live-webinar-content">
                    <img
                      src={item.thumbnail}
                      alt="live-web-img"
                      style={{ maxHeight: "35vh" }}
                    />
                    <div className="school-live-webinar-content-text">
                      <div className="school-live-webinar-content-count">
                        <span>{index + 1}</span>/
                        <span style={{ marginLeft: "5px" }}>{arr.length}</span>
                      </div>
                      <h3
                        style={{
                          color:
                            backendSectionData.isusingsecondarystyles === true
                              ? themeData.themestyles.secondarytextcolor
                              : themeData.themestyles.primarytextcolor,
                          fontFamily: themeData.themestyles.fontfamily,
                        }}
                        className="text-header"
                      >
                        {item.title}
                      </h3>
                      <p
                        style={{
                          color:
                            backendSectionData.isusingsecondarystyles === true
                              ? themeData.themestyles.secondarytextcolor
                              : themeData.themestyles.primarytextcolor,
                          fontFamily: themeData.themestyles.fontfamily,
                        }}
                      >
                        {item.description}
                      </p>
                      <span
                        style={{
                          color:
                            backendSectionData.isusingsecondarystyles === true
                              ? themeData.themestyles.secondarytextcolor
                              : themeData.themestyles.primarytextcolor,
                          fontFamily: themeData.themestyles.fontfamily,
                        }}
                      >
                        {handleTimeDisplay(item.startTime).split(" ")[2]}{" "}
                        {handleTimeDisplay(item.startTime).split(" ")[3]} at{" "}
                        {handleTimeDisplay(item.startTime).split(" ")[0]}.
                        {handleTimeDisplay(item.startTime).split(" ")[1]}.
                      </span>
                      <div className="button-wrapper">
                        {authenticated && confirmPayment(item._id) && (
                          <Link to={`/livewebinar/watch/${item.streamKey}`}>
                            <Button
                              style={{
                                marginRight:"10px",
                                backgroundColor:
                                  themeData.themestyles.buttontextcolor,
                                borderRadius:
                                  themeData.themestyles.buttonborderradius,
                                color:
                                  themeData.themestyles.buttonbackgroundcolor,
                              }}
                            >
                              Join Webinar
                            </Button>
                          </Link>
                        )}

                        {streams?.length > 0 && currentItem > 0 && (
                          <Button
                            style={{
                              color: theme?.themestyles.navbartextcolor,
                              backgroundColor:
                                theme?.themestyles.navbarbackgroundcolor,
                              fontFamily: theme?.themestyles.fontfamily,
                              boxShadow: "none",
                              border: `1px solid ${theme?.themestyles.navbartextcolor}`,
                              transform: "none",
                            }}
                            onClick={() => {
                              setCurrentItem(currentItem - 1);
                            }}
                          >
                            Previous Webinar
                          </Button>
                        )}
                        {!(authenticated && confirmPayment(item._id)) && (
                          <Link
                            to={`/live/preview/${item._id}`}
                            style={{ marginRight: "1rem" }}
                          >
                            <Button
                              style={{
                                backgroundColor:
                                  themeData.themestyles.buttontextcolor,
                                borderRadius:
                                  themeData.themestyles.buttonborderradius,
                                color:
                                  themeData.themestyles.buttonbackgroundcolor,
                              }}
                            >
                              Get Access{" "}
                            </Button>
                          </Link>
                        )}
                        {streams?.length > currentItem + 1 && (
                          <Button
                            style={{
                              color: theme?.themestyles.navbartextcolor,
                              backgroundColor:
                                theme?.themestyles.navbarbackgroundcolor,
                              fontFamily: theme?.themestyles.fontfamily,
                              boxShadow: "none",
                              border: `1px solid ${theme?.themestyles.navbartextcolor}`,
                              transform: "none",
                            }}
                            onClick={() => {
                              setCurrentItem(currentItem + 1);
                            }}
                          >
                            Next Webinar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              );
            })}
            {/*  */}
          </div>
        </section>
      )}
    </>
  );
}
