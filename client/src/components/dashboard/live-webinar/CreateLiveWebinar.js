import React, { useEffect, useState } from "react";
import { useRef } from "react";
import { useDispatch, connect } from "react-redux";
import { startLoading, stopLoading } from "../../../actions/appLoading";
import axios from "axios";
import { useAlert } from "react-alert";
import setAuthToken from "../../../utilities/setAuthToken";

import {
  Col,
  Container,
  Row,
  Button,
  Card,
  Modal,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import "../../../custom-styles/dashboard/live-webinar.css";
import DashboardNavbar from "../DashboardNavbar";

import { Link, useHistory } from "react-router-dom";

function CreateLiveWebinar({ school }) {
  const alert = useAlert();
  const history = useHistory();
  const [recurring, setRecurring] = useState(false);
  const thumbnailInputRef = useRef();
  const [showModal, setShowModal] = useState(false);
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [streamLink, setStreamLink] = useState("");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [rootCategoryListing, setCategoryListingData] = useState([]);
  const [customRep, setCustomRep] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [fee, setFee] = useState("");
  const [fileToSend, setFileToSend] = useState(null);
  const [imageToCloudinary, setImageToCloudinary] = useState(null);
  const [recurringFrequency, setRecurringFrequency] = useState("");
  const [webinarReps, setWebinarReps] = useState("");
  const [freeWebinar, setFreeWebinar] = useState(null);

  const dispatch = useDispatch();

  const handleTimeChange = (e) => {
    const selectedTime = e.target.value; // Assuming the time value is in the correct format, e.g., "HH:mm"
    const selectedDateTime = new Date(`${date}T${selectedTime}`);
    const currentDateTime = new Date();

    if (selectedDateTime < currentDateTime) {
      // alert.show("Selected datetime is less than current datetime");
      alert.show("Selected date is earlier than the current date");

      // Perform necessary actions if the datetime is less than the current datetime
      // For example, display an error message or disable a submit button
    } else {
      setTime(selectedTime);
    }
  };
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

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 10);

    if (selectedDate < currentDate) {
      alert.show("Selected date is earlier than the current date");
      // Perform necessary actions if the date is earlier than the current date
      // For example, display an error message or disable a submit button
    } else {
      setDate(e.target.value);
    }
  };

  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
  };

  const handleEndDateChange = (e) => {
    const selectedEndDate = e.target.value;
    if (date && selectedEndDate > date) {
      setEndDate(selectedEndDate);
    } else {
      alert.show("End date must be after start date", {
        type: "error",
      });
    }
  };

  const formReset = () => {
    setRecurring(false);
    setTime("");
    setEndTime("");
    setDate("");
    setEndDate("");
    setTitle("");
    setCategory("");
    setDescription("");
    setCustomRep("");
    setCurrency("USD");
    setFee("");
    setRecurringFrequency("");
    setWebinarReps("");
    setFileToSend(null);
  };
  const filePickerEventHandle = (e) => {
    if (e.target.files.length === 0) {
      setFileToSend(null);
    }

    const fileSize = e?.target?.files[0]?.size / 1024 / 1024; // file size in mb
    if (fileSize > 30) {
      return alert.show(
        "File Size exceeds maximum limit, choose another file",
        {
          type: "error",
        }
      );
    }

    if (!/^image\//.test(e?.target?.files[0]?.type)) {
      return alert.show(`File ${e?.target?.files[0]?.name} is not an image.`, {
        type: "error",
      });
    }

    setFileToSend(e.target.files[0]);
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      function () {
        setImageToCloudinary(reader.result);
      },
      false
    );

    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getCategoryListing = async (query = "") => {
    try {
      const res = await axios.get(
        `/api/v1/rootcategory/categorytitle?data=${query}`
      );
      setCategoryListingData(res.data);
    } catch (error) {
      console.error(error);
    }
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
    history.push("/dashboard/livewebinar");
  }
  const convertToDate = (time, date) => {
    const [hours, minutes] = time.split(":");
    const [year, month, day] = date.split("-");
    const combinedDate = new Date(year, month - 1, day, hours, minutes);
    if (isNaN(combinedDate.getTime())) {
      return ""; // Return an empty string for an invalid date
    }

    return combinedDate;
  };

  const handleSubmit = async (e) => {
    if (
      title === "" ||
      category === "" ||
      description === "" ||
      fee === "" ||
      currency === "" ||
      (recurring === true &&
        (recurringFrequency === "" ||
          webinarReps === "" ||
          endTime === "" ||
          endDate === "")) ||
      (webinarReps.toLowerCase() === "custom" && customRep === "") ||
      imageToCloudinary === null ||
      time === "" ||
      date === "" ||
      fileToSend === ""
    ) {
      alert.show("Please complete fields", {
        type: "error",
      });
    } else {
      const formData = new FormData();
      formData.append("isRecurring", recurring);
      formData.append("title", title);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("fee", fee);
      formData.append("currency", currency);
      formData.append("customRep", customRep);
      formData.append("recurringFrequency", recurringFrequency);
      formData.append("webinarReps", webinarReps);
      formData.append("file", fileToSend);
      formData.append("startTime", convertToDate(time, date));
      formData.append("endTime", convertToDate(endTime, endDate));

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
          console.log(res);

          // check fee
          // decide what to update streamlink as
          setStreamLink(
            res.fee > 0
              ? `live/preview/${res.data._id}`
              : `livewebinar/watch/${res.data.streamKey}`
          );
          dispatch(stopLoading());

          setShowModal(true);
          formReset();
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };
  // const handleSubmit = async (e) => {
  //   if (
  //     title === "" ||
  //     category === "" ||
  //     description === "" ||
  //     fee === "" ||
  //     currency === "" ||
  //     recurringFrequency === "" ||
  //     webinarReps === "" ||
  //     fileToSend === "" ||
  //     time === "" ||
  //     date === "" ||
  //     (recurring === true && recurringFrequency === "") ||
  //     (recurring === true && webinarReps === "")
  //   ) {
  //     console.log(
  //       title,
  //       category,
  //       description,
  //       fee,
  //       currency,
  //       customRep,
  //       recurringFrequency,
  //       webinarReps,
  //       fileToSend
  //     );
  //   } else {
  //     const formData = new FormData();
  //     formData.append("isRecurring", recurring);
  //     formData.append("title", title);
  //     formData.append("category", category);
  //     formData.append("description", description);
  //     formData.append("fee", fee);
  //     formData.append("currency", currency);
  //     formData.append("customRep", customRep);
  //     formData.append("recurringFrequency", recurringFrequency);
  //     formData.append("webinarReps", webinarReps);
  //     formData.append("file", fileToSend);
  //     formData.append("startTime", convertToDate(time, date));
  //     formData.append("endDate", convertToDate(endTime, endDate));

  //     const config = {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     };
  //     const body = formData;
  //     if (localStorage.getItem("token")) {
  //       setAuthToken(localStorage.getItem("token"));
  //     }
  //     dispatch(startLoading());
  //     await axios
  //       .post("/api/v1/livewebinar", body, config)
  //       .then((res) => {
  //         setStreamLink(res.data.streamKey);
  //         dispatch(stopLoading());

  //         setShowModal(true);
  //         formReset();
  //       })
  //       .catch((error) => {
  //         console.error(error);
  //       });
  //   }
  // };

  const pickThumbnailFile = () => {
    thumbnailInputRef.current.click();
  };

  const dailyRepOption = [
    "Everyday",
    "Every 2 days",
    "Every 3 days",
    "Every 4 days",
    "Every 5 days",
    "Every 6 days",
    "Custom",
  ];

  const weeklyRepOption = [
    "Weekly",
    "Every 2 weeks",
    "Every 3 weeks",
    "Every 1st week of the month",
    "Every 2nd week of the month",
    "Every 3rd week of the month",
    "Every Last week of the month",
  ];
  const customRepOption = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  let dateCheck = () => {
    let a = new Date(endDate);
    let b = new Date(date);
    if (b > a) {
      alert.show("End date must be after start date", {
        type: "error",
      });
    }
  };
  useEffect(() => {
    getCategoryListing();
    dateCheck();
  }, [endDate]);
  return (
    <div className="dashboard-layout">
      <Container fluid>
        <Row>
          <DashboardNavbar />
          <Col className="page-actions__col">
            <div className="live-webinar">
              <Modal centered isOpen={showModal}>
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "20",
                    color: "#242121",
                    textTransform: "uppercase",
                  }}
                  className="modal-header"
                >
                  Classroom created
                </div>
                <ModalBody>
                  <p
                    style={{
                      overflowWrap: "break-word",
                      textAlign: "center",
                    }}
                  >
                    {" "}
                    {getSchoolUrl(school.name)}/{streamLink}

                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button
                    className="modal-btn-style-outline"
                    style={{
                      paddingLeft: "40px",
                      paddingRight: "40px",
                    }}
                    onClick={() => {
                      copyText(streamLink);
                      setShowModal(false);
                    }}
                  >
                    Copy Url
                  </Button>{" "}
                  <Button
                    className="modal-btn-style"
                    style={{
                      paddingLeft: "40px",
                      paddingRight: "40px",
                    }}
                    onClick={() => {
                      setShowModal(false);
                      history.push("/dashboard/livewebinar");
                    }}
                  >
                    Close
                  </Button>
                </ModalFooter>
              </Modal>
              <div className="live-webinar-content">
                <div className="page-title">
                  <div className="page-title__text">
                    Schedule your Classroom
                  </div>
                </div>
                <Card className="webinar-container">
                  <Link to="/dashboard/livewebinar/setup">
                    <p>Back</p>
                  </Link>
                  <form className="webinarform">
                    <strong>Class Date & Time</strong>
                    <div className="time-constraints">
                      <p style={{ marginBottom: "0.5rem" }}>Recurring</p>
                      <input
                        type="checkbox"
                        checked={!recurring}
                        onChange={() => {
                          setRecurring(false);
                        }}
                      />
                      <span>No</span>
                      <input
                        type="checkbox"
                        checked={recurring}
                        onChange={() => {
                          setRecurring(true);
                        }}
                        style={{ marginLeft: "1rem" }}
                      />
                      <span>Yes</span>
                    </div>
                    {!recurring && (
                      <div
                        className="date-wrapper"
                        style={{
                          paddingBottom: "1.5rem",
                        }}
                      >
                        <input
                          type="time"
                          value={time}
                          onChange={handleTimeChange}
                          placeholder="HH:MM"
                          style={{
                            width: "29%",
                          }}
                        />
                        <input
                          type="date"
                          value={date}
                          onChange={handleDateChange}
                          placeholder="DD"
                        />{" "}
                      </div>
                    )}
                    {recurring && (
                      <div className="recurring-frequency-wrapper">
                        <p
                          style={{
                            marginBottom: ".5rem",
                            fontWeight: "normal",
                            color: "#000",
                          }}
                        >
                          Select recurring frequency
                        </p>
                        <select
                          onChange={(e) => {
                            setRecurringFrequency(e.target.value);
                          }}
                        >
                          <option value="" disabled selected hidden>
                            Select frequency
                          </option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                        {recurringFrequency === "daily" && (
                          <>
                            <div className="daily-options-wrapper">
                              {dailyRepOption.map((item) => {
                                return (
                                  <p
                                    onClick={() => {
                                      setWebinarReps(item);
                                    }}
                                    className={`${
                                      webinarReps === item ? "active" : ""
                                    }`}
                                  >
                                    {item}
                                  </p>
                                );
                              })}
                            </div>
                            {webinarReps.toLowerCase() === "custom" && (
                              <div className="daily-options-wrapper">
                                {customRepOption.map((item) => {
                                  return (
                                    <p
                                      onClick={() => {
                                        setCustomRep(item);
                                      }}
                                      className={`${
                                        customRep === item ? "active" : ""
                                      }`}
                                    >
                                      {item.charAt(0)}
                                    </p>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        )}
                        {recurringFrequency === "weekly" && (
                          <div className="daily-options-wrapper">
                            {weeklyRepOption.map((item) => {
                              return (
                                <p
                                  onClick={() => {
                                    setWebinarReps(item);
                                  }}
                                  className={`${
                                    webinarReps === item ? "active" : ""
                                  }`}
                                >
                                  {item}
                                </p>
                              );
                            })}
                          </div>
                        )}
                        {recurringFrequency === "monthly" && (
                          <div className="monthly-option">
                            <div className="date-wrapper-parent">
                              <div className="start">
                                <p>Start Date</p>
                                <div className="date-wrapper">
                                  <input
                                    type="time"
                                    value={time}
                                    onChange={handleTimeChange}
                                    placeholder="HH:MM"
                                  />
                                  <input
                                    type="date"
                                    value={date}
                                    onChange={handleDateChange}
                                    placeholder="Date"
                                    style={{
                                      minWidth: "fit-content",
                                    }}
                                  />{" "}
                                </div>
                              </div>
                              <hr />
                              <div className="start">
                                <p>End Date</p>
                                <div className="date-wrapper">
                                  <input
                                    type="time"
                                    value={endTime}
                                    onChange={handleEndTimeChange}
                                    placeholder="HH:MM"
                                  />
                                  <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => {
                                      handleEndDateChange(e);
                                    }}
                                    placeholder="Date"
                                    style={{
                                      minWidth: "fit-content",
                                    }}
                                  />{" "}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {recurringFrequency !== "monthly" && (
                          <div className="date-wrapper-parent">
                            <div className="start">
                              <p>Start Date</p>
                              <div className="date-wrapper">
                                <input
                                  type="time"
                                  value={time}
                                  onChange={handleTimeChange}
                                  placeholder="HH:MM"
                                  style={{
                                    width: "fit-content",
                                  }}
                                />
                                <input
                                  type="date"
                                  value={date}
                                  onChange={handleDateChange}
                                  placeholder="Date"
                                />{" "}
                              </div>
                            </div>
                            <div className="start end">
                              <p>End Date</p>
                              <div className="date-wrapper">
                                <input
                                  type="time"
                                  value={endTime}
                                  onChange={(e) => {
                                    setEndTime(e.target.value);
                                  }}
                                  placeholder="HH:MM"
                                  style={{
                                    width: "fit-content",
                                  }}
                                />
                                <input
                                  type="date"
                                  value={endDate}
                                  onChange={(e) => {
                                    handleEndDateChange(e);
                                  }}
                                  placeholder="Date"
                                />{" "}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <strong>Classroom information</strong>
                    <div className="form-image">
                      <input
                        style={{ display: "none" }}
                        ref={thumbnailInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => filePickerEventHandle(e)}
                      />
                      <Button
                        onClick={pickThumbnailFile}
                        className="btn-updates"
                        block
                      >
                        {fileToSend === null
                          ? "Upload Thumbnail"
                          : "Change Thumbnail"}
                      </Button>
                      {fileToSend !== null && (
                        <>
                          <div className="upload-image-contents">
                            <div className="upload-image-container">
                              <img src={imageToCloudinary} alt="..." />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="form-item">
                      <strong className="title-strong"> Classroom Title</strong>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    <div className="form-item" style={{ overflow: "hidden" }}>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="" disabled selected hidden>
                          Select Category
                        </option>
                        {rootCategoryListing?.map((item, index) => {
                          return (
                            <option key={index} value={item.title}>
                              {item.title}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="form-item" style={{ overflow: "hidden" }}>
                      <textarea
                        placeholder="Webinar Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      ></textarea>
                    </div>
                    {/* <div className="time-constraints">
                      <input
                        type="checkbox"
                        style={{
                          width: "1.2rem",
                          height: "1.2rem",
                        }}
                        checked={freeWebinar}
                        onChange={() => {
                          setFreeWebinar(!freeWebinar);
                        }}
                      />

                      <span>Free Webinar</span>
                    </div>
                    <div className="form-item double">
                      <strong>Webinar Fee</strong>
                      <div className="fee-wrapper">
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
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
                            const value = e.target.value.replace(/[^0-9]/g, "");
                            setFee(value);
                          }}
                        />
                      </div>
                    </div> */}
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
                            setCurrency("USD");
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
                        {/* <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          disabled={freeWebinar}
                        > */}
                        
                          <p value={"USD"}>USD</p>
                        {/* </select> */}
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

                    <div className="button-wrapper">
                      <Button
                        className="page-title_cta-btn"
                        onClick={handleSubmit}
                      >
                        Schedule Class
                      </Button>
                    </div>
                  </form>
                </Card>
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

export default connect(mapStateToProps)(CreateLiveWebinar);
