import React, { useState } from "react";

import { Col, Container, Row, Button, Card, Spinner, Modal } from "reactstrap";
import DashboardNavbar from "../DashboardNavbar";
import { startLoading, stopLoading } from "../../../actions/appLoading";
import axios from "axios";
import "../../../custom-styles/dashboard/choose-live-webinar.css";
import alarm from "../../../images/alarm-add.svg";
import scheduled from "../../../images/scheduled.svg";
import instant from "../../../images/instant.png";
import { useAlert } from "react-alert";
import { Link, useHistory } from "react-router-dom";
import { useDispatch, connect } from "react-redux";
import setAuthToken from "../../../utilities/setAuthToken";

function ChooseWebinarType({school}) {
  const [webinarType, setWebinarType] = useState("");
  const alert = useAlert();
  const history = useHistory();

  const dispatch = useDispatch();

  const [instantClass, setInstantClass] = useState(false);

  const [title, setTitle] = useState("");
  const [freeWebinar, setFreeWebinar] = useState(null);
  const [currency, setCurrency] = useState("");
  const [fee, setFee] = useState("");
  const [fileToSend, setFileToSend] = useState(null);

  const timestamp = Date.now();
  console.log(school)
  const getSchoolUrl = (schoolname) => {
    const host = window.location.host;
    if (host.includes("localhost")) {
      return `http://${schoolname}.${host}`;
    }
    const baseDomain = host.split(".")[1];
    return baseDomain.includes("localhost")
      ? `http://${schoolname}.${baseDomain}`
      : `https://${schoolname}.${baseDomain}.com`;
  };
  function copyText(textToCopy) {
    navigator.clipboard
      // .writeText(`${getSchoolUrl(school.name)}/live/preview/${textToCopy}`)
      .writeText(`${getSchoolUrl(school.name)}/${textToCopy}`)

      .then(() => {})
      .catch((error) => {
        console.error("Error copying text: ", error);
      });
    alert.show("Link Copied", {
      type: "success",
    });
  }

  const handleSubmit = async () => {
    if (title === "" || fee === "" || currency === "") {
      alert.show("Please complete fields", {
        type: "error",
      });
    } else {
      // const createFileObject = (url, filename, mimeType) => {
      //   return (fetch(url)
      //     .then((response) => response.arrayBuffer())
      //     .then((buffer) => new File([buffer], filename, { type: mimeType }))
      //   );
      // };

      // // Create the File object from the imported image
      // createFileObject(instant, 'instant.png', 'image/png').then((file) => {
      //   setFileToSend(file);
      // });
      const formData = new FormData();
      formData.append("isRecurring", false);
      formData.append("title", title);
      formData.append("category", "instant");
      formData.append("description", "instant");
      formData.append("fee", fee);
      formData.append("currency", currency);
      formData.append("file", fileToSend, "instant.png");
      formData.append("startTime", timestamp);
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const body = formData;
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      dispatch(startLoading());
      await axios
        .post("/api/v1/livewebinar", body, config)
        .then((res) => {
          history.push(`/dashboard/livewebinar/stream/${res?.data.streamKey}`);
          console.log(res.data, res.data.school);
          copyText(
            `livewebinar/watch/${res?.data.streamKey}`
          );
          dispatch(stopLoading());
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };
  // On component mount, create the File object from the imported image
  React.useEffect(() => {
    // Fetch the image file and create a File object
    fetch(instant)
      .then((response) => response.blob())
      .then((blob) => {
        const file = new File([blob], "instant.png", { type: "image/png" });
        setFileToSend(file);
      })
      .catch((error) => {
        console.error("Error fetching the image:", error);
      });
  }, []);

  return (
    <div className="dashboard-layout">
      <Container fluid>
        <Row>
          <DashboardNavbar />

          <Col className="page-actions__col">
            <div className="live-webinar">
              <div className="live-webinar-content">
                {/* <NotificationNavbar /> */}

                <div className="page-title">
                  <div className="page-title__text"> Start a new class</div>
                  <div className="page-title_cta">
                    {/* <Button
                    className="page-title_cta-btn"
                    onClick={() => {
                      setInstantWebinar(true);
                    }}
                  >
                    <i className="fas fa-plus mr-2"></i> Instant Webinar
                  </Button> */}
                  </div>
                </div>
                {!instantClass && (
                  <Card className="webinar-type-options">
                    <p className="page-title__text">
                      When do you want to start your class?{" "}
                    </p>

                    <div className="interactive-buttons">
                      <div
                        className={
                          webinarType === "scheduled" ? "selected" : ""
                        }
                        onClick={() => {
                          setWebinarType("scheduled");
                        }}
                      >
                        <img src={scheduled} alt="scheduled-webinar" />
                        <p>Scheduled</p>
                      </div>

                      <div
                        className={webinarType === "instant" ? "selected" : ""}
                        onClick={() => {
                          setWebinarType("instant");
                        }}
                      >
                        <img src={alarm} alt="instant-webinar" />
                        <p>Instant</p>
                      </div>
                    </div>
                    <div className="button-wrapper">
                      {webinarType === "scheduled" && (
                        <Link to="/dashboard/livewebinar/create">
                          <Button className="page-title_cta-btn">
                            Continue
                          </Button>
                        </Link>
                      )}
                      {webinarType === "instant" && (
                        <Button
                          className="page-title_cta-btn"
                          onClick={() => setInstantClass(true)}
                        >
                          Continue
                        </Button>
                      )}
                      {webinarType === "" && <Button disabled>Continue</Button>}
                    </div>
                  </Card>
                )}
                {instantClass && (
                  <Card className="instant-webinar-options">
                    <Link
                      to="/dashboard/livewebinar/setup"
                      onClick={() => {
                        setInstantClass(false);
                        setWebinarType();
                      }}
                    >
                      <p>Back</p>
                    </Link>
                    <p className="page-title__text">Classroom Information </p>
                    <form>
                      <div className="form-item">
                        <strong className="title-strong">
                          {" "}
                          Classroom Title
                        </strong>

                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>
                      <div className="time-constraints">
                        <input
                          type="checkbox"
                          style={{
                            width: "1.2rem",
                            height: "1.2rem",
                          }}
                          checked={freeWebinar}
                          onChange={() => {
                            if (!freeWebinar) {
                              // Disable the "Webinar Fee" functionality when free webinar is checked
                              setCurrency("NGN");
                              setFee(0);
                            }
                            setFreeWebinar(!freeWebinar);
                          }}
                        />
                        <span>Free Class</span>
                      </div>

                      <div
                        className={`form-item double ${
                          freeWebinar ? "disabled" : ""
                        }`}
                      >
                        <strong>Classroom Fee</strong>
                        <div className="fee-wrapper">
                          <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            disabled={freeWebinar}
                          >
                            <option value="" disabled selected hidden>
                              Select Currency
                            </option>
                            <option value={"NGN"}>NGN</option>
                            <option value={"USD"}>USD</option>
                          </select>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="Amount"
                            value={fee}
                            onChange={(e) => {
                              if (!freeWebinar) {
                                const value = e.target.value.replace(
                                  /[^0-9]/g,
                                  ""
                                );
                                setFee(value);
                              }
                            }}
                            disabled={freeWebinar}
                          />
                        </div>
                      </div>
                    </form>
                    <div className="button-wrapper">
                      {(title === "" || fee === "" || currency === "") && (
                        <Button disabled>Start Now</Button>
                      )}
                      {!(title === "" || fee === "" || currency === "") && (
                        <Button
                          onClick={() => {
                            handleSubmit();
                          }}
                        >
                          Start Now
                        </Button>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}


const mapStateToProps = (state) => ({
  school: state.school.schoolDetails,
  loggedInUsername: state?.auth?.user?.username,
});

export default connect(mapStateToProps)(ChooseWebinarType);