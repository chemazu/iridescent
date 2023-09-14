import React, { useState, useRef, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  UPDATE_DASHBOARD_PAGE_COUNTER,
  SHOW_PAYMENT_MODAL,
} from "../../../actions/types";
import { startLoading, stopLoading } from "../../../actions/appLoading";
import axios from "axios";
import { useAlert } from "react-alert";
import {
  Row,
  Col,
  Container,
  Form,
  FormGroup,
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  Progress,
} from "reactstrap";
import DashboardNavbar from "../DashboardNavbar";
import NotificationNavbar from "../NotificationNavbar";
import { createNewCourse } from "../../../actions/course";
import setAuthToken from "../../../utilities/setAuthToken";

import "../../../custom-styles/dashboard/dashboardlayout.css";
import "../../../custom-styles/dashboard/createcourse.css";

const CreateCourse = ({
  school,
  createSchoolCourse,
  history,
  updatePageSelector,
  loggedInUsername,
}) => {
  const alert = useAlert();
  const thumbnailInputRef = useRef();
  const [fileToSend, setFileToSend] = useState(null);
  const [imageToCloudinary, setImageToCloudinary] = useState(null);
  const [showUploadModalThumnail, setShowUploadModalThumnail] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [categoryListing, setCategoryListing] = useState([]);
  const [rootCategory, setRootCategoryListing] = useState([]);
  const dispatch = useDispatch();
  const [validCourseTitle, setValidCourseTitle] = useState(true);
  const [formInputs, setFormInputs] = useState({
    title: "",
    subtitle: "",
    category: "",
    rootcategory: "",
    description: "",
    prerequisite: "",
    language: "",
    level: "",
    thumbnail: "",
    coursethumbnailId: "",
    tutorEmail: "",
    price: 0,
  });

  useEffect(() => {
    updatePageSelector(3);
    // eslint-disable-next-line
  }, []);

  const {
    title,
    subtitle,
    category,
    rootcategory,
    description,
    prerequisite,
    language,
    level,
    price,
    tutorEmail,
  } = formInputs;

  const closeUploadThumbnailModal = () => setShowUploadModalThumnail(false);
  // eslint-disable-next-line
  const launchUploadThumbnailModal = () => setShowUploadModalThumnail(true);

  const handleFormSubmitHandler = (e) => {
    e.preventDefault();

    if (title.length === 0) {
      return alert.show("title cannot be empty", {
        type: "error",
      });
    }

    if (subtitle.length === 0) {
      return alert.show("subtitle cannot be empty", {
        type: "error",
      });
    }

    if (category.length === 0) {
      return alert.show("category cannot be empty", {
        type: "error",
      });
    }

    if (rootcategory.length === 0) {
      return alert.show("sub category cannot be empty", {
        type: "error",
      });
    }

    if (description.length === 0) {
      return alert.show("description cannot be empty", {
        type: "error",
      });
    }

    if (prerequisite.length === 0) {
      return alert.show("prerequisite cannot be empty", {
        type: "error",
      });
    }

    if (language.length === 0) {
      return alert.show("language cannot be empty", {
        type: "error",
      });
    }

    if (level.length === 0) {
      return alert.show("level cannot be empty", {
        type: "error",
      });
    }

    if (!fileToSend) {
      return alert.show("Course thumbnail not found", {
        type: "error",
      });
    }

    if (price < 2000) {
      return alert.show("invalid product price", {
        type: "error",
      });
    }

    if (loggedInUsername?.toLowerCase() === "courses") {
      if (tutorEmail.length === 0) {
        return alert.show("You have to provide your registered Tutor email", {
          type: "error",
        });
      }
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("category", category);
    formData.append("rootcategory", rootcategory);
    formData.append("description", description);
    formData.append("prerequisite", prerequisite);
    formData.append("language", language);
    formData.append("level", level);
    formData.append("file", fileToSend);
    formData.append("price", price);

    if (tutorEmail.length > 0) {
      formData.append("tutorEmail", tutorEmail.toLowerCase());
    }

    createSchoolCourse(
      formData,
      school._id,
      history,
      "/dashboard/course/setup/module"
    );
  };

  const updateFormFields = (e) => {
    if (e.target.name === "title") {
      if (/[$&+,:;=?@#|'<>.{}^*()%!-]/g.test(e.target.value) === true) {
        setValidCourseTitle(false);
      } else {
        setValidCourseTitle(true);
      }
    }
    if (e.target.name === "rootcategory" && e.target.value.length > 0) {
      setSelectedCategoryFromcategoryDropdownSelect(e.target.value);
    }
    setFormInputs({
      ...formInputs,
      [e.target.name]: e.target.value,
    });
  };

  const setSelectedCategoryFromcategoryDropdownSelect = async (
    categoryName
  ) => {
    const categoryNameToloweCase = categoryName.toLowerCase();
    const selectedRootCategory = rootCategory.find(
      (category) => category.title.toLowerCase() === categoryNameToloweCase
    );
    await getSubCategoryListingByRootCategoryId(selectedRootCategory._id);
  };

  const updatePriceFormField = (e) => {
    const priceText = e.target.value;

    if (!priceText || priceText.match(/^\d{1,}(\.\d{0,2})?$/)) {
      setFormInputs({
        ...formInputs,
        price: e.target.value,
      });
    }
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

  const uploadThumbnail = async () => {
    const cloudinaryCloudName = "kolaniyi";
    const CloudinaryUploadPreset = "bqrfvvim";
    const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/upload`;

    const form = new FormData();
    form.append("upload_preset", CloudinaryUploadPreset);
    form.append("file", imageToCloudinary);

    // axios header config
    const config = {
      onUploadProgress: (event) => {
        setLoaded((event.loaded / event.total) * 100);
      },
    };

    try {
      delete axios.defaults.headers.common["x-auth-token"];
      const res = await axios.post(cloudinaryUploadUrl, form, config);
      setFormInputs({
        ...formInputs,
        thumbnail: res.data.url,
        coursethumbnailid: res.data.public_id,
      });
      alert.show("Thumbnail Uploaded Successfully", {
        type: "success",
      });
      setFileToSend(null); // reset image
      setImageToCloudinary(null); // reset image
      closeUploadThumbnailModal(); // close thumbnail
      setLoaded(0);
    } catch (error) {
      console.log(error);
    }
  };

  const pickThumbnailFile = () => {
    thumbnailInputRef.current.click();
  };

  const validateUserCourseCountBeforePush = async () => {
    try {
      dispatch(startLoading());
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      await axios.get("/api/v1/course/user/createcourse");
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((element) => {
          alert.show(element.msg, {
            type: "error",
          });
        });
      }
      if (error.response.status === 402) {
        dispatch({
          type: SHOW_PAYMENT_MODAL,
        });
      }
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  const getCategoryListing = async (query = "") => {
    try {
      const res = await axios.get(
        `/api/v1/rootcategory/categorytitle?data=${query}`
      );
      setRootCategoryListing(res.data);
    } catch (error) {
      alert.show(error, {
        type: "error",
      });
      console.log(error);
    }
  };

  const getSubCategoryListingByRootCategoryId = async (selectedCategoryId) => {
    try {
      const res = await axios.get(`/api/v1/coursetype/${selectedCategoryId}`);
      setCategoryListing(res.data);
    } catch (error) {
      alert.show(error, {
        type: "error",
      });
      console.log(error);
    }
  };

  useEffect(() => {
    updatePageSelector(4);
    validateUserCourseCountBeforePush();
    getCategoryListing();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="dashboard-layout">
        <Container fluid>
          <Row>
            <DashboardNavbar />
            <Col className="page-actions__col">
              <div className="page-actions">
                <NotificationNavbar />
                <div className="page-actions__create-course-form">
                  <Card className="create-course-card mt-5">
                    <CardBody>
                      <h1 className="page-action__info text-center">
                        Create New Course
                      </h1>
                      <Form onSubmit={(e) => handleFormSubmitHandler(e)}>
                        <FormGroup>
                          <input
                            type="text"
                            class="form__input"
                            placeholder="Course Title"
                            name="title"
                            id="title"
                            value={title}
                            onChange={(e) => updateFormFields(e)}
                            required
                            autoFocus
                          />
                          <label for="title" className="form__label">
                            Course Title
                          </label>
                          {validCourseTitle === false && (
                            <p
                              style={{
                                color: "red",
                              }}
                            >
                              course title cannot contain special characters
                            </p>
                          )}
                        </FormGroup>
                        <FormGroup>
                          <input
                            type="text"
                            class="form__input"
                            placeholder="Course Subtitle"
                            name="subtitle"
                            id="subtitle"
                            value={subtitle}
                            onChange={(e) => updateFormFields(e)}
                            required
                          />
                          <label for="subtitle" className="form__label">
                            Course Subtitle
                          </label>
                        </FormGroup>
                        <FormGroup>
                          <Input
                            type="select"
                            className="form__input"
                            placeholder="Select Category"
                            name="rootcategory"
                            id="rootcategory"
                            value={rootcategory}
                            onChange={(e) => updateFormFields(e)}
                            required
                          >
                            <option value="">Choose Category</option>
                            {rootCategory.map((field) => (
                              <option
                                value={field?.title?.toLowerCase()}
                                key={field._id}
                              >
                                {field.title}
                              </option>
                            ))}
                          </Input>
                        </FormGroup>
                        <FormGroup>
                          <Input
                            type="select"
                            className="form__input"
                            placeholder="Select Category"
                            name="category"
                            id="category"
                            value={category}
                            onChange={(e) => updateFormFields(e)}
                            required
                          >
                            <option value="">Choose Sub Category</option>
                            {categoryListing.map((field) => (
                              <option
                                value={field?.title?.toLowerCase()}
                                key={field._id}
                              >
                                {field.title}
                              </option>
                            ))}
                          </Input>
                        </FormGroup>
                        <FormGroup>
                          <Input
                            className="form__input"
                            placeholder="Course description"
                            rows="3"
                            type="textarea"
                            name="description"
                            value={description}
                            onChange={(e) => updateFormFields(e)}
                            autoComplete="off"
                          />
                        </FormGroup>
                        <FormGroup>
                          <input
                            type="text"
                            class="form__input"
                            placeholder="Prerequisites"
                            name="prerequisite"
                            id="prerequisite"
                            value={prerequisite}
                            onChange={(e) => updateFormFields(e)}
                            required
                          />
                          <label for="prerequisites" className="form__label">
                            Prerequisites
                          </label>
                        </FormGroup>
                        <FormGroup>
                          <Input
                            type="select"
                            class="form__input"
                            placeholder="Select Language"
                            name="language"
                            id="language"
                            value={language}
                            onChange={(e) => updateFormFields(e)}
                            required
                          >
                            <option value="">Select Language</option>
                            <option value="english">English</option>
                            <option value="french">French</option>
                            <option value="spanish">Spanish</option>
                            <option value="arabic">Arabic</option>
                            <option value="yoruba">Yoruba</option>
                            <option value="west african pidgin">
                              West African Pidgin
                            </option>
                            <option value="igbo">Igbo</option>
                          </Input>
                        </FormGroup>
                        <FormGroup>
                          <Input
                            type="select"
                            class="form__input"
                            placeholder="Select Level"
                            name="level"
                            id="level"
                            value={level}
                            onChange={(e) => updateFormFields(e)}
                            required
                          >
                            <option value="">Select Level</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </Input>
                        </FormGroup>
                        <FormGroup>
                          <input
                            type="number"
                            class="form__input"
                            placeholder="Course Price"
                            name="price"
                            id="price"
                            value={price}
                            onChange={(e) => updatePriceFormField(e)}
                            required
                          />
                          <label for="price" className="form__label">
                            Course Price (&#8358;){" "}
                          </label>
                          {price < 2000 && (
                            <p
                              style={{
                                color: "red",
                              }}
                            >
                              product price cannot be less than 2000
                            </p>
                          )}
                        </FormGroup>
                        {loggedInUsername?.toLowerCase() === "courses" && (
                          <>
                            <FormGroup>
                              <input
                                type="email"
                                class="form__input"
                                placeholder="Your Registered Tutors Email"
                                name="tutorEmail"
                                id="tutorEmail"
                                value={tutorEmail}
                                onChange={(e) => updateFormFields(e)}
                              />
                              <label for="price" className="form__label">
                                Your Registered Tutors Email
                              </label>
                            </FormGroup>
                          </>
                        )}
                        <FormGroup>
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
                          {/* {
            fileToSend === null && <p className="mt-2 create-course-validation-text">course thumbnail cannot be empty</p>
          } */}
                        </FormGroup>
                        <FormGroup className="mt-3">
                          <Button
                            className="create-course-btn"
                            type="submit"
                            size="lg"
                            block
                            disabled={
                              fileToSend === null ||
                              validCourseTitle === false ||
                              price < 2000
                            }
                          >
                            Create Course
                          </Button>
                        </FormGroup>
                      </Form>
                    </CardBody>
                  </Card>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <div className="create-course-modal">
        <Modal centered isOpen={showUploadModalThumnail}>
          <div
            style={{
              fontWeight: "700",
              fontSize: "20",
              color: "#242121",
              textTransform: "uppercase",
            }}
            className="modal-header"
          >
            Upload Course Thumbnail
          </div>
          <ModalBody>
            {fileToSend !== null && fileToSend !== undefined && (
              <>
                <div className="picked-file-container">
                  <div
                    style={{
                      width: "80%",
                      margin: "0 auto",
                    }}
                  >
                    <p
                      style={{
                        overflowWrap: "break-word",
                        textAlign: "center",
                      }}
                      className="lead text-center"
                    >
                      {fileToSend.name}
                    </p>
                  </div>
                  {loaded > 0 && (
                    <Row>
                      <Col sm="12" md="12">
                        <div className="course-thumbnail-upload-progress">
                          <p className="lead">Upload Progress</p>
                          {
                            <Progress
                              striped
                              max="100"
                              style={{
                                backgroundColor: "#242121",
                              }}
                              value={loaded}
                            >
                              {Math.round(loaded, 2)}%
                            </Progress>
                          }
                        </div>
                      </Col>
                    </Row>
                  )}
                </div>
              </>
            )}
            <Button block onClick={pickThumbnailFile}>
              Pick File
            </Button>
          </ModalBody>
          <ModalFooter>
            <Button
              style={{
                color: "#242121",
                backgroundColor: "#fff",
                border: "1px solid #242121",
                paddingLeft: "40px",
                paddingRight: "40px",
              }}
              onClick={closeUploadThumbnailModal}
            >
              Cancel
            </Button>{" "}
            <Button
              disabled={fileToSend === null}
              onClick={(e) => uploadThumbnail()}
              style={{
                color: "#fff",
                backgroundColor: "#242121",
                paddingLeft: "40px",
                paddingRight: "40px",
              }}
            >
              Upload
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  school: state?.school?.schoolDetails,
  loggedInUsername: state?.auth?.user?.username,
});

const mapDispatchToProps = (dispatch) => ({
  createSchoolCourse: (formData, schoolId, history, routeTo) =>
    dispatch(createNewCourse(formData, schoolId, history, routeTo)),
  updatePageSelector: (counter) =>
    dispatch({ type: UPDATE_DASHBOARD_PAGE_COUNTER, payload: counter }),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(CreateCourse));
