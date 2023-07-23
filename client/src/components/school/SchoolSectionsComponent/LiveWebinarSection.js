import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useStore } from "react-redux";
import "../../../custom-styles/schoollandingpagecomponents/livewebinarsectionstyles.css";
import { Button } from "reactstrap";
import { Link } from "react-router-dom";
import setAuthToken from "../../../utilities/setAuthToken";
import AuthenticationModal from "../AuthenticationModal";

export default function LiveWebinarSection({ schoolname, theme }) {
  const [userStreams, setUserStreams] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMore, setViewMore] = useState(false);
  const [authModal, setAuthModal] = useState(false);

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
  const toggleAuthModal = () => {
    setAuthModal(!authModal);
  };
  const getPurchasedWebinars = async () => {
    try {
      if (localStorage.getItem("token")) {
        console.log("first");
        setAuthToken(localStorage.getItem("token"));
        const res = await axios.get(`/api/v1/studentwebinar/${schoolname}`);
        setPurchasedWebinar(res.data);
        setPurchasedWebinarLoading(false);
      }
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
    console.log(schoolname);

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

  const streams = userStreams;
  console.log(userStreams);
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
  const courseListContainerRef = useRef();
  const scroll = (scrollOffset) => {
    courseListContainerRef.current.scrollLeft += scrollOffset;
  };
  return (
    <>
      {" "}
      {streams?.length > 0 && (
        <section className="school-course-list school-webinar-list">
          <div className="courselist-container">
            <div className="header-controller__and__controls">
              <h3 className="header">UpComing Webinars</h3>
              <div className="controls">
                <div onClick={() => scroll(-30)} className="left-arrow-control">
                  <i className="fas fa-arrow-left"></i>
                </div>
                <div onClick={() => scroll(30)} className="right-arrow-control">
                  <i className="fas fa-arrow-right"></i>
                </div>
              </div>
            </div>
            <div
              ref={courseListContainerRef}
              className="course-item-container pl-3"
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: "50%",
                      margin: "20px auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                    }}
                  >
                    <i
                      style={{ fontSize: "22px" }}
                      className="fas fa-circle-notch fa-spin"
                    ></i>
                  </div>
                </>
              ) : (
                <>
                  {streams?.length === 0 ? (
                    <p className="text-center mb-2 mt-2"></p>
                  ) : (
                    <>
                      {streams.map((webinaritem) => {
                        console.log(webinaritem);
                        // Use appropriate type for `webinaritem`
                        return (
                          <div
                            className="course__item webinar-item mb-3"
                            key={webinaritem._id}
                            style={{
                              boxShadow:
                                themeData.themedefaultstyles
                                  ?.coursecardhasShadow === true
                                  ? "0px 7px 29px 0px rgba(100, 100, 111, 0.2)"
                                  : "none",
                            }}
                          >
                            <div className="item-img-container">
                              <Link to={`/live/preview/${webinaritem._id}`}>
                                <img
                                  src={webinaritem.thumbnail}
                                  alt="thumbnail img"
                                />
                              </Link>
                            </div>
                            <div
                              style={{
                                backgroundColor:
                                  themeData.themedefaultstyles
                                    ?.coursecardbackgroundcolor,
                              }}
                              className="course-item__details-container"
                            >
                              <Link to={`live/preview/${webinaritem._id}`}>
                                <div
                                  style={{
                                    color:
                                      themeData.themedefaultstyles
                                        ?.coursecardtextcolor,
                                    fontFamily:
                                      themeData.themedefaultstyles?.fontfamily,
                                  }}
                                  title={webinaritem.title}
                                  className="course-item-name"
                                >
                                  {webinaritem.title}
                                </div>
                              </Link>
                              <div
                                style={{
                                  color:
                                    themeData.themedefaultstyles
                                      ?.coursecardtextcolor,
                                  fontFamily:
                                    themeData.themedefaultstyles?.fontfamily,
                                }}
                                className="course-item-author-name"
                              >
                                by{" "}
                                {`${webinaritem.creator.firstname} ${webinaritem.creator.lastname}`}
                              </div>
                              {/* <div
                                style={{
                                  color:
                                    themeData.themedefaultstyles
                                      ?.coursecardtextcolor,
                                  fontFamily:
                                    themeData.themedefaultstyles?.fontfamily,
                                  borderColor:
                                    themeData.themedefaultstyles
                                      ?.coursecardtextcolor,
                                }}
                                className="course-item-level mt-1"
                              >
                                {webinaritem.category}
                              </div> */}
                              <div
                                style={{
                                  color:
                                    themeData.themedefaultstyles
                                      ?.coursecardtextcolor,
                                  fontFamily:
                                    themeData.themedefaultstyles?.fontfamily,
                                }}
                                className="course-item-price"
                              >
                                {webinaritem.fee <= 0 ? (
                                  <p>Free Webinar</p>
                                ) : (
                                  <>&#8358; {webinaritem.fee}</>
                                )}
                              </div>
                              <div
                                style={{
                                  justifyContent: "flex-end",
                                  display: "flex",
                                }}
                              >
                                {!(
                                  authenticated &&
                                  confirmPayment(webinaritem._id)
                                ) &&
                                  (webinaritem.fee === 0 ? (
                                    <Link
                                      to={`/livewebinar/watch/${webinaritem.streamKey}`}
                                      style={{ marginRight: "1rem" }}
                                    >
                                      <Button
                                        style={{
                                          backgroundColor:
                                            themeData.themestyles
                                              .buttontextcolor,
                                          borderRadius:
                                            themeData.themestyles
                                              .buttonborderradius,
                                          color:
                                            themeData.themestyles
                                              .buttonbackgroundcolor,
                                        }}
                                      >
                                        Free Webinar
                                      </Button>
                                    </Link>
                                  ) : (
                                    <Link
                                      to={`/live/preview/${webinaritem._id}`}
                                      style={{ marginRight: "1rem" }}
                                    >
                                      <Button
                                        style={{
                                          backgroundColor:
                                            themeData.themestyles
                                              .buttontextcolor,
                                          borderRadius:
                                            themeData.themestyles
                                              .buttonborderradius,
                                          color:
                                            themeData.themestyles
                                              .buttonbackgroundcolor,
                                        }}
                                      >
                                        Get Access{" "}
                                      </Button>
                                    </Link>
                                  ))}
                                {/* <Link
                                  to={`/live/preview/${webinaritem._id}`}
                                  style={{ marginRight: "1rem" }}
                                >
                                  <Button
                                    style={{
                                      backgroundColor:
                                        themeData.themestyles.buttontextcolor,
                                      borderRadius:
                                        themeData.themestyles
                                          .buttonborderradius,
                                      color:
                                        themeData.themestyles
                                          .buttonbackgroundcolor,
                                    }}
                                  >
                                    Get Access{" "}
                                  </Button>
                                </Link> */}
                              </div>
                            </div>
                            {webinaritem.isLive && (
                              <p className="live-button">Live</p>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          <AuthenticationModal
            schoolName={schoolname}
            authModal={authModal}
            toggleAuthModal={toggleAuthModal}
            theme={theme}
          />
        </section>
      )}
    </>
  );
}
