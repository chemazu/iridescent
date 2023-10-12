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
  Spinner,
} from "reactstrap";
import "../../../custom-styles/dashboard/live-webinar.css";
import DashboardNavbar from "../DashboardNavbar";

import { Link, useHistory, useParams } from "react-router-dom";
import InvalidStream from "./InvalidStream";
/* eslint-disable react-hooks/exhaustive-deps */
function EditLiveWebinar() {
  const alert = useAlert();
  const history = useHistory();
  const { id } = useParams();
  let webinarId = id;

  const [recurring, setRecurring] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

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
  const [currency, setCurrency] = useState("");
  const [fee, setFee] = useState("");
  const [fileToSend, setFileToSend] = useState(null);
  const [imageToCloudinary, setImageToCloudinary] = useState(null);
  const [recurringFrequency, setRecurringFrequency] = useState("");
  const [webinarReps, setWebinarReps] = useState("");
  const [freeWebinar, setFreeWebinar] = useState(null);
  const [prevFee, setPrevFee] = useState(null);
  const [school, setSchool] = useState(null);

  const dispatch = useDispatch();

  const validateWebinar = async () => {
    setIsLoading(true);

    try {
      let res = await axios.get(
        `/api/v1/livewebinar/streamdetails/${webinarId}`
      );

      if (res.data) {
        let { data } = res;
        setIsValid(true);

        setTitle(data.title);
        setTime(data.startTime.slice(11, 16));
        setDate(data.startTime.slice(0, 10));
        setEndTime(data.endTime?.slice(11, 16));
        setEndDate(data.endTime?.slice(0, 10));
        setCategory(data.category);
        setDescription(data.description);

        // setCustomRep("");
        setCurrency(data.currency);
        setFee(data.fee);
        setPrevFee(data.fee);
        // setRecurringFrequency(recurringFrequency);
        setImageToCloudinary(data.thumbnail);
        setFileToSend(data.webinarthumbnailid);

        setIsLoading(false);
       setStreamLink(data)

        setSchool(data.school);
      } else {
        setIsLoading(false);
        setIsValid(false);
      }

      // if (res.data.school === schoolname && res.data.timeLeft > 0) {
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      setIsValid(false);
    }
  };
  // function to get
  // update variables
  // set loading

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
    setCurrency("");
    setFee("");
    setRecurringFrequency("");
    setWebinarReps("");
    setFileToSend(null);
  };
  //   {
  //     "isLive": false,
  //     "viewers": [],
  //     "isRecurring": false,
  //     "recurringFrequency": "",
  //     "recurringDays": [],
  //     "fee": 1111,
  //     "currency": "NGN",
  //     "_id": "64a2ae62e1ac20348cddb2fb",
  //     "title": "start",
  //     "description": "erwrer",
  //     "streamKey": "691493e1-82f8-45e7-a085-05dadac54538",
  //     "streamUrl": "691493e1-82f8-45e7-a085-05dadac54538",
  //     "startTime": "2023-07-05T15:17:00.000Z",
  //     "thumbnail": "https://res.cloudinary.com/kolaniyi/image/upload/v1688383073/tuturly/webinar/start/izmteyal8qcras9pvat0.jpg",
  //     "webinarthumbnailid": "tuturly/webinar/start/izmteyal8qcras9pvat0",
  //     "category": "Business",
  //     "creator": "637e9927fd030c0dda85554c",
  //     "endTime": null,
  //     "school": "637e997dfd030c0dda85554d",
  //     "timeleft": 1601,
  //     "__v": 0,
  //     "streamStarted": 1688549168005
  // }
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
  const getSchoolUrl = (schoolname) => {
    const host = window.location.host;
    if (host.includes("localhost")) {
      return `http://${schoolname}.${host}`;
    }

    const parts = host.split(".");

    const baseDomain = parts[0] === "www" ? parts[1] : parts[0];

    return baseDomain.includes("localhost")
      ? `http://${schoolname}.${baseDomain}`
      : `https://${schoolname}.${baseDomain}.com`;
  };
  function copyText(textToCopy) {
    console.log(textToCopy);
    if (textToCopy.fee === 0) {
      navigator.clipboard
        .writeText(
          `${getSchoolUrl(school?.name)}/livewebinar/watch/${
            textToCopy.streamKey
          }`
        )

        .then(() => {})
        .catch((error) => {
          console.error("Error copying text: ", error);
        });
      alert.show("Link Copied", {
        type: "success",
      });
    } else {
      navigator.clipboard
        .writeText(
          `${getSchoolUrl(school?.name)}/live/preview/${textToCopy._id}`
        )

        .then(() => {})
        .catch((error) => {
          console.error("Error copying text: ", error);
        });
      alert.show("Link Copied", {
        type: "success",
      });
    }
  }
  let editTimer = () => {
    const [hours, minutes] = time.split(":");
    const [year, month, day] = date.split("-");
    const combinedDate = new Date(year, month - 1, day, hours, minutes);
    return combinedDate;
  };

  const convertToDate = (time, date) => {
 
    if (time || date) {
      const [hours, minutes] = time.split(":");
      const [year, month, day] = date.split("-");
      const combinedDate = new Date(year, month - 1, day, hours, minutes);
      if (isNaN(combinedDate.getTime())) {
        return ""; // Return an empty string for an invalid date
      }

      return combinedDate;
    } else {
      return "";
    }
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
      formData.append("startTime", editTimer());
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
        .put(`/api/v1/livewebinar/${webinarId}`, body, config)
        .then((res) => {
          console.log(streamLink)
          // setStreamLink(res.data);

          console.log(res.data)
          dispatch(stopLoading());
          // console.log(streamLink)

          setShowModal(true);
          formReset();
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

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
  useEffect(() => {
    validateWebinar();
  }, [webinarId]);

  return isLoading ? (
    <div className="edit-spinner">
      <Spinner />
    </div>
  ) : isValid ? (
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
                  Stream Updated
                </div>
                <ModalBody>
                  <p
                    style={{
                      overflowWrap: "break-word",
                      textAlign: "center",
                    }}
                  >
                    {" "}
     
                    {fee === 0
                      ? `${getSchoolUrl(school?.name)}/livewebinar/watch/${
                          streamLink.streamKey
                        }`
                      : `${getSchoolUrl(school?.name)}/live/preview/${
                          streamLink._id
                        }`}
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
                    Edit your live webinar :<strong> {title}</strong>
                  </div>
                </div>
                <Card className="webinar-container">
                  <Link to="/dashboard/livewebinar">
                    <p>Back</p>
                  </Link>
                  <form className="webinarform">
                    <strong>Webinar Date & Time</strong>
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

                    <strong>Webinar information</strong>
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
                      <strong className="title-strong">Webinar Title</strong>
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
                    {/* <div className="form-item double">
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
                            setFreeWebinar(!freeWebinar);
                          } else {
                            console.log(fee);
                            setFreeWebinar(!freeWebinar);
                            setFee(prevFee);
                          }
                        }}
                      />
                      <span>Free Webinar</span>
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
                            } else {
                              setFee(0);
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
                        Save Changes
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
  ) : (
    <InvalidStream />
  );
}
const mapStateToProps = (state) => ({
  school: state.school.schoolDetails,
  loggedInUsername: state?.auth?.user?.username,
});

export default connect(mapStateToProps)(EditLiveWebinar);
