import React, { useEffect, useState } from "react";
import { useRef } from "react";
import { useDispatch, connect } from "react-redux";
import { startLoading, stopLoading } from "../../../actions/appLoading";

import axios from "axios";
import { useAlert } from "react-alert";
import LiveWebinarDropZone from "./LiveWebinarDropZone";
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
 
import { Link } from "react-router-dom";

function CreateLiveWebinar() {
  const alert = useAlert();
  const [recurring, setRecurring] = useState(false);
  const [image, setImage] = useState(null);
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
  const dispatch = useDispatch();

  const handleTimeChange = (e) => {
    setTime(e.target.value);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
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
    setFileToSend(null)
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
  const acceptWebinarImage = (file) => {
    if (file.name.match(/\.(jpg|png|gif|svg|jpeg)$/)) {
      setImage(file);
    } else {
      alert.show("invalid file type", {
        type: "error",
      });
    }
  };
  function copyText(textToCopy) {
    navigator.clipboard
      .writeText(
        `http://localhost:3000/dashboard/livewebinar/stream/${textToCopy}`
      )
      .then(() => {
        console.log("Text copied to clipboard");
      })
      .catch((error) => {
        console.error("Error copying text: ", error);
      });
    alert.show("Link Copied", {
      type: "success",
    });
  }

  const handleSubmit = async (e) => {
    const formData = new FormData();
    formData.append("image", image);
    formData.append("isRecurring", recurring);
    // formData.append("startTime", startDateTime);
    // formData.append("endTime", endDateTime);
    formData.append("title", title);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("fee", fee);
    formData.append("currency", currency);
    formData.append("customRep", customRep);
    formData.append("recurringFrequency", recurringFrequency);
    formData.append("webinarReps", webinarReps);
    formData.append("file", fileToSend);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    const body = formData;
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    await axios
      .post("/api/v1/livewebinar", body, config)
      .then((res) => {
        console.log(res.data);

        setStreamLink(res.data.streamKey);
        setShowModal(true);
        formReset();
      })
      .catch((error) => {
        console.error(error);
      });
  };
  // const uploadThumbnail = async () => {
  //   const cloudinaryCloudName = "kolaniyi";
  //   const CloudinaryUploadPreset = "bqrfvvim";
  //   const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/upload`;

  //   const form = new FormData();
  //   form.append("upload_preset", CloudinaryUploadPreset);
  //   form.append("file", imageToCloudinary);

  //   // axios header config
  //   const config = {
  //     onUploadProgress: (event) => {
  //       setLoaded((event.loaded / event.total) * 100);
  //     },
  //   };

  //   try {
  //     delete axios.defaults.headers.common["x-auth-token"];
  //     const res = await axios.post(cloudinaryUploadUrl, form, config);
  //     setFormInputs({
  //       ...formInputs,
  //       thumbnail: res.data.url,
  //       coursethumbnailid: res.data.public_id,
  //     });
  //     alert.show("Thumbnail Uploaded Successfully", {
  //       type: "success",
  //     });
  //     setFileToSend(null); // reset image
  //     setImageToCloudinary(null); // reset image
  //     closeUploadThumbnailModal(); // close thumbnail
  //     setLoaded(0);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  // const handleSubmit = (e) => {
  //   e.preventDefault();

  //   const [hour, minute] = time.split(":");
  //   const [year, month, day] = date.split("-");

  //   const [endHour, endMinute] = endTime?.split(":");
  //   const [endYear, endMonth, endDay] = endDate?.split("-");

  //   const startDateTime = new Date(year, month - 1, day, hour, minute);
  //   const endDateTime = new Date(
  //     endYear,
  //     endMonth - 1,
  //     endDay,
  //     endHour,
  //     endMinute
  //   );

  //   const formData = {
  //     isRecurring: recurring,
  //     startTime: startDateTime,
  //     endTime: endDateTime,
  //     title,
  //     category,
  //     description,
  //     fee,
  //     currency,
  //     customRep,
  //     recurringFrequency,
  //     webinarReps,
  //     image,
  //   };

  //   if (
  //     startDateTime === null ||
  //     title?.length < 1 ||
  //     category?.length < 1 ||
  //     description?.length < 1 ||
  //     fee?.length < 1 ||
  //     currency?.length < 1 ||
  //     (recurring &&
  //       (recurringFrequency?.length < 1 || webinarReps?.length < 1)) ||
  //     new Date(date) > new Date(endDate) ||
  //     (recurringFrequency === "Custom" && customRep?.length < 1)
  //   ) {
  //     alert.show("Please fill all required fields");
  //   } else {
  //     if (localStorage.getItem("token")) {
  //       setAuthToken(localStorage.getItem("token"));
  //     }
  //     const config = {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     };

  //     // dispatch(startLoading())
  //     // console.log(formData)
  //     axios
  //       .post("/api/v1/livewebinar/", submitData, config)
  //       .then((res) => {
  //         console.log(res.data);
  //         dispatch(stopLoading());
  //         setStreamLink(res.data.streamKey);
  //         setShowModal(true);
  //         formReset();
  //       })
  //       .catch((error) => {
  //         console.error(error);
  //       });
  //   }
  // };

  //  if (!fileToSend) {
  //       return alert.show("Course thumbnail not found", {
  //         type: "error",
  //       });
  //     }
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
    console.log(endDate, date);
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
                  Stream Created
                </div>
                <ModalBody>
                  http://localhost:3000/dashboard/livewebinar/stream/
                  {streamLink}
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
                    }}
                  >
                    Close
                  </Button>
                </ModalFooter>
              </Modal>
              <div className="live-webinar-content">
                <div className="page-title">
                  <div className="page-title__text">
                    Schedule your live webinar
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
                                    value={time}
                                    onChange={handleTimeChange}
                                    placeholder="HH:MM"
                                  />
                                  <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                      setEndDate(e.target.value);
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
                                    setEndDate(e.target.value);
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
                      {/* <LiveWebinarDropZone
                        acceptWebinarImage={acceptWebinarImage}
                      /> */}
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
                          type="number"
                          placeholder="Amount"
                          value={fee}
                          onChange={(e) => setFee(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="button-wrapper">
                      <Button
                        className="page-title_cta-btn"
                        onClick={handleSubmit}
                      >
                        Schedule Webinar
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
