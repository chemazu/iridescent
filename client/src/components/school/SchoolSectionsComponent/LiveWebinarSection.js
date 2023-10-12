import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { connect, useStore } from "react-redux";
import "../../../custom-styles/schoollandingpagecomponents/livewebinarsectionstyles.css";
import { Button } from "reactstrap";
import { Link } from "react-router-dom";
import setAuthToken from "../../../utilities/setAuthToken";
import AuthenticationModal from "../AuthenticationModal";
import roundToTwoDecimalPlaces from "../../../utilities/roundToTwoDecimalPlaces";
import CurrencyFormat from "react-currency-format";
/* eslint-disable react-hooks/exhaustive-deps */

function LiveWebinarSection({ schoolname, theme, currency }) {
  const [userStreams, setUserStreams] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState(false);

  const [purchasedWebinar, setPurchasedWebinar] = useState([]);

  const store = useStore();
  const appState = store.getState();
  const { student } = appState;
  const { authenticated } = student;

  let themeData = theme;
  console.log(currency);
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

  const streams = userStreams;
  console.log(userStreams);
 
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
                        console.log(webinaritem, themeData);
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
                              backgroundColor:
                                themeData.themestyles.secondarybackgroundcolor,
                            }}
                          >
                            <div className="item-img-container">
                              <Link
                                to={
                                  webinaritem.fee > 0
                                    ? `/live/preview/${webinaritem._id}`
                                    : `/livewebinar/watch/${webinaritem.streamKey}`
                                }
                              >
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
                              <Link
                                to={
                                  webinaritem.fee > 0
                                    ? `/live/preview/${webinaritem._id}`
                                    : `/livewebinar/watch/${webinaritem.streamKey}`
                                }
                              >
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
                                  color: "#fff",

                                  fontFamily:
                                    themeData.themedefaultstyles?.fontfamily,
                                }}
                                className="course-item-price"
                              >
                                {webinaritem.fee <= 0 ? (
                                  <p>Free Webinar</p>
                                ) : (
                                  <>
                                    <span
                                      dangerouslySetInnerHTML={{
                                        __html: currency.htmlCurrencySymbol,
                                      }}
                                    ></span>
                                    <CurrencyFormat
                                      value={roundToTwoDecimalPlaces(
                                        webinaritem.fee * currency.exchangeRate
                                      )}
                                      displayType="text"
                                      thousandSeparator={true}
                                      decimalScale={1}
                                      fixedDecimalScale={true}
                                    />
                                  </>
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
                                      to={
                                        webinaritem.fee > 0
                                          ? `/live/preview/${webinaritem._id}`
                                          : `/livewebinar/watch/${webinaritem.streamKey}`
                                      }
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
                              </div>
                            </div>
                            {webinaritem.isLive && (
                              // <p className="live-button">Live</p>
                              <div className="status">
                              {webinaritem.endStatus ||
                              today > webinaritem.classEndTime ||
                              !webinaritem.classEndTime === 0 ? (
                                <p></p>
                              ) : webinaritem.isLive ? (
                                <p className="live-button"> Live</p>
                              ) : webinaritem.isPublished ? (
                                <p></p>
                              ) : (
                                <p></p>
                              )}
                            </div>
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
const mapStateToProps = (state) => ({
  currency: state.currency,
});

export default connect(mapStateToProps)(LiveWebinarSection);
