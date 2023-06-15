import React, { useEffect, useState, useRef } from "react";
import { connect, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import axios from "axios";
import {
  Row,
  Col,
  Container,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  Card,
  CardBody,
  Form,
  FormGroup,
  Input,
} from "reactstrap";
import { useAlert } from "react-alert";
import setAuthToken from "../../../utilities/setAuthToken";
import DashboardNavbar from "../DashboardNavbar";
import { UPDATE_COURSE } from "../../../actions/types";
import { startLoading, stopLoading } from "../../../actions/appLoading";
import {
  getCourseById,
  publishCourse,
  retractCourse,
} from "../../../actions/course";
// import StartRatings from "react-star-ratings"
import CourseModuleOrganiser from "../create-courses/CreateCourseSetupPages/CourseModuleOrganiser";

import "../../../custom-styles/dashboard/dashboardlayout.css";
import "../../../custom-styles/dashboard/coursepreviewpage.css";
import NotificationNavbar from "../NotificationNavbar";

export const PreviewPageForExistingCourse = ({
  match,
  course,
  getCourse,
  publish,
  retract,
}) => {
  // const totalCourseRatings = course?.reviews?.reduce((prev, curr) => {
  //     return prev + curr.star
  // }, 0)

  const [rootCategory, setRootCategoryListing] = useState([]);
  const [categoryListing, setCategoryListing] = useState([]);
  const [showUpdateCourseModal, setShowUpdateCourseModal] = useState(false);
  const [
    displayPostToExploreConfirmationModal,
    setDisplayPostToConfirmationModal,
  ] = useState(false);

  const [courseObject, updateCourseObject] = useState({
    title: "",
    subtitle: "",
    category: "",
    rootcategory: "",
    description: "",
    prerequisite: "",
    language: "",
    level: "",
    price: 0,
    coursediscount: "",
  });

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
  } = courseObject;

  const [confirmPostToExplore, setConfirmPostToExplore] = useState(false);

  const alert = useAlert();

  const updateImageRef = useRef();

  const closeUpdateCourseModal = () => setShowUpdateCourseModal(false);
  const openUpdateCourseModal = () => setShowUpdateCourseModal(true);

  const openPostToExploreModal = () => setDisplayPostToConfirmationModal(true);
  const closePostToExploreModal = () =>
    setDisplayPostToConfirmationModal(false);

  const history = useHistory();

  const dispatch = useDispatch();

  const handleImageUpdateHandler = async (e) => {
    if (e.target.files.length === 0) {
      return alert.show("image file not selected!", {
        type: "error",
      });
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

    if (!e.target.files[0].type.includes("image")) {
      return alert.show("file type must be an image", {
        type: "error",
      });
    }

    const formData = new FormData();
    formData.append("thumbnail", e.target.files[0]);

    dispatch(startLoading());

    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const body = formData;
      const res = await axios.put(
        `/api/v1/course/${course._id}/thumbnail`,
        body,
        config
      );
      dispatch({
        type: UPDATE_COURSE,
        payload: res.data,
      });
      alert.show("course thumbnail updated successfully", {
        type: "success",
      });
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      const errors = error.response.data.errors;
      if (errors) {
        return errors.forEach((element) => {
          alert.show(element.msg, {
            type: "error",
          });
        });
      }
      alert.show(error.message, { type: "error" });
    }
  };

  const handlePostCourseForVerificationClick = async () => {
    dispatch(startLoading());
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify({
        courseId: course._id,
        title: course.title,
      });
      await axios.post(`/api/v1/courseverification`, body, config);
      alert.show(
        "your course verification application has been submitted successfully",
        {
          type: "success",
        }
      );
      dispatch(stopLoading());
      closePostToExploreModal();
      setConfirmPostToExplore(false);
    } catch (error) {
      dispatch(stopLoading());
      const errors = error.response.data.errors;
      if (errors) {
        return errors.forEach((element) => {
          alert.show(element.msg, {
            type: "error",
          });
        });
      }
      alert.show(error.message, { type: "error" });
    }
  };

  const imageUpdateBtnHandler = () => updateImageRef.current.click();

  const updateCourseData = (e) => {
    if (e.target.name === "rootcategory" && e.target.value.length > 0) {
      setSelectedCategoryFromcategoryDropdownSelect(e.target.value);
    }
    updateCourseObject({
      ...courseObject,
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

  const updateCourseDiscountOnCourseData = (e) => {
    const discount = e.target.value;
    if (!discount || discount.match(/^\d{1,}(\.\d{0,2})?$/)) {
      updateCourseObject({
        ...courseObject,
        coursediscount: e.target.value,
      });
    }
  };

  const handleBackToCoursesPage = () => history.push("/dashboard/courses");

  const onHandleCourseUpdate = () => {
    if (title.length === 0) {
      return alert.show("course title cannot be empty", {
        type: "error",
      });
    }
    if (subtitle.length === 0) {
      return alert.show("course subtitle cannot be empty", {
        type: "error",
      });
    }
    if (category.length === 0) {
      return alert.show("course category cannot be empty", {
        type: "error",
      });
    }
    if (description.length === 0) {
      return alert.show("course description cannot be empty", {
        type: "error",
      });
    }
    if (prerequisite.length === 0) {
      return alert.show("course prerequisite cannot be empty", {
        type: "error",
      });
    }
    if (language.length === 0) {
      return alert.show("course language cannot be empty", {
        type: "error",
      });
    }
    if (level.length === 0) {
      return alert.show("course level cannot be empty", {
        type: "error",
      });
    }
    if (!price) {
      return alert.show("course price not valid", {
        type: "error",
      });
    }
    updateCourseById(course._id, courseObject);
    closeUpdateCourseModal();
  };

  const publishCourse = () => {
    publish(course._id);
  };

  const unpublishCourse = () => {
    retract(course._id);
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

  const updateCourseById = async (courseId, updateBody) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify(updateBody);
    dispatch(startLoading());
    try {
      const res = await axios.put(`/api/v1/course/${courseId}`, body, config);
      dispatch({
        type: UPDATE_COURSE,
        payload: res.data,
      });
      alert.show("update completed successfully", {
        type: "success",
      });
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      alert.show("error updating course", {
        type: "error",
      });
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((element) => {
          alert(element.msg);
        });
      }
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
    if (course !== null) {
      updateCourseObject({
        title: course.title,
        subtitle: course.subtitle,
        category: course.category,
        rootcategory: course?.rootcategory !== null ? course?.rootcategory : "",
        description: course.description,
        prerequisite: course.prerequisite,
        language: course.language,
        level: course.level,
        price: course.price,
        coursediscount: course?.coursediscount,
      });
    }
  }, [course]);

  useEffect(() => {
    getCourse(match.params.courseId);
  }, [getCourse, match.params.courseId]);

  useEffect(() => {
    getCategoryListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                <div className="mt-5 course-item-preview-page">
                  <Container>
                    {course === null ? (
                      <p className="text-center lead">Loading...</p>
                    ) : (
                      <>
                        <div className="page-title">
                          <h2 className="page-title__text">
                            Course Preview and Update
                          </h2>
                          <Button
                            onClick={handleBackToCoursesPage}
                            className="page-title__cta"
                          >
                            <i className="fas fa-arrow-left mr-2"></i> Back to
                            My Courses
                          </Button>
                        </div>
                        <div className="dashboard-course-item-details mt-4">
                          <div className="dashboard-course-item-details-img-contain">
                            <input
                              onChange={handleImageUpdateHandler}
                              ref={updateImageRef}
                              style={{
                                display: "none",
                              }}
                              type="file"
                            />
                            <div
                              onClick={imageUpdateBtnHandler}
                              className="dashboard-course-thumbnail-update"
                            >
                              <div className="update-course-thumbnail__btn">
                                <i className="fas fa-camera"></i>
                                Update Course Thumbnail
                              </div>
                            </div>
                            <img
                              src={course.thumbnail}
                              className="img-fluid"
                              alt="course thumbnail previewer"
                            />
                          </div>
                          <div className="dashboard-course-item-about">
                            <div className="course-details__container">
                              <h3>{course.title}</h3>
                              <p className="dashboard-course-item__update-status">
                                {course.published === true
                                  ? "Published"
                                  : "Not Published"}
                              </p>
                              <p className="publisher-details mt-3">{`${course.author.firstname} ${course.author.lastname}`}</p>
                              <h4 className="course-item-price">
                                &#8358;{course.price}
                              </h4>
                            </div>
                            <div className="course-actions">
                              <div className="course-actions__btn">
                                <Button
                                  onClick={openUpdateCourseModal}
                                  className="update-course-btn"
                                >
                                  Update Course
                                </Button>
                                {course.published === false ? (
                                  <Button
                                    onClick={publishCourse}
                                    className="publish-course-actions-btn"
                                  >
                                    Publish Course
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={unpublishCourse}
                                    className="publish-course-actions-btn"
                                  >
                                    Retract Course
                                  </Button>
                                )}
                              </div>
                              <div className="course-actions__btn">
                                <Button
                                  onClick={openPostToExploreModal}
                                  className="update-course-btn__modify"
                                >
                                  Post on Explore
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </Container>
                </div>
                <CourseModuleOrganiser />
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <Modal size="lg" isOpen={showUpdateCourseModal}>
        <div
          style={{
            fontWeight: "700",
            fontSize: "20",
            color: "#242121",
            textTransform: "uppercase",
          }}
          className="modal-header"
        >
          Update Course - {course?.title}
        </div>
        <ModalBody>
          <div className="update-course-card">
            <Card>
              <CardBody>
                <Form>
                  <FormGroup>
                    <input
                      type="text"
                      class="form__input"
                      placeholder="Course Title"
                      name="title"
                      id="title"
                      value={courseObject.title}
                      onChange={(e) => updateCourseData(e)}
                      required
                      autoFocus
                    />
                    <label for="title" className="form__label">
                      Course Title
                    </label>
                  </FormGroup>
                  <FormGroup>
                    <input
                      type="text"
                      class="form__input"
                      placeholder="Course Subtitle"
                      name="subtitle"
                      id="subtitle"
                      value={courseObject.subtitle}
                      onChange={(e) => updateCourseData(e)}
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
                      onChange={(e) => updateCourseData(e)}
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
                      placeholder="Select Sub Category"
                      name="category"
                      id="category"
                      value={courseObject.category}
                      onChange={(e) => updateCourseData(e)}
                      required
                      style={{
                        textTransform: "capitalize",
                      }}
                    >
                      <option value="">Choose Sub Category</option>
                      {categoryListing.map((field) => (
                        <option
                          value={field?.title?.toLowerCase()}
                          key={field._id}
                          style={{
                            textTransform: "capitalize",
                          }}
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
                      value={courseObject.description}
                      onChange={(e) => updateCourseData(e)}
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
                      value={courseObject.prerequisite}
                      onChange={(e) => updateCourseData(e)}
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
                      value={courseObject.language}
                      onChange={(e) => updateCourseData(e)}
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
                      value={courseObject.level}
                      onChange={(e) => updateCourseData(e)}
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
                      type="text"
                      class="form__input"
                      placeholder="Course Price (₦)"
                      name="price"
                      id="price"
                      value={courseObject.price}
                      onChange={(e) => updateCourseData(e)}
                      required
                    />
                    <label for="price" className="form__label">
                      Course Price (₦)
                    </label>
                  </FormGroup>
                  <FormGroup>
                    <input
                      type="text"
                      class="form__input"
                      placeholder="Course Discount (%)"
                      name="coursediscount"
                      id="coursediscount"
                      value={courseObject.coursediscount}
                      onChange={(e) => updateCourseDiscountOnCourseData(e)}
                      required
                    />
                    <label for="coursediscount" className="form__label">
                      Course Discount (%)
                    </label>
                  </FormGroup>
                </Form>
              </CardBody>
            </Card>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            className="modal-btn-style-outline"
            style={{
              paddingLeft: "40px",
              paddingRight: "40px",
            }}
            onClick={closeUpdateCourseModal}
          >
            Cancel
          </Button>{" "}
          <Button
            onClick={onHandleCourseUpdate}
            className="modal-btn-style"
            style={{
              paddingLeft: "40px",
              paddingRight: "40px",
            }}
          >
            Update
          </Button>
        </ModalFooter>
      </Modal>
      {/* modal for post to explore page confirmation */}
      <Modal size="md" centered isOpen={displayPostToExploreConfirmationModal}>
        <div className="modal-header post-to-explore-modal__header">
          <h4>Confirm Post to Explore</h4>
          <div
            className="close-confirm-post-to-explore__modal"
            onClick={closePostToExploreModal}
          >
            <i className="fas fa-times"></i>
          </div>
        </div>
        <div className="modal-body">
          <div className="modal-body__confirmation-container">
            <p>
              I accept that my courses will be reviewed by tuturly for
              appearance on our public course explore page.
            </p>

            <p className="mt-5">
              <Input
                type="checkbox"
                checked={confirmPostToExplore}
                onChange={() => setConfirmPostToExplore(!confirmPostToExplore)}
              />
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <Button
            onClick={closePostToExploreModal}
            block
            className="modal-btn-style-outline mt-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePostCourseForVerificationClick}
            block
            className="modal-btn-style"
            disabled={confirmPostToExplore === false}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => ({
  course: state.course.courseDetails,
});

const mapDispatchToProps = (dispatch) => ({
  getCourse: (courseId) => dispatch(getCourseById(courseId)),
  publish: (courseId) => dispatch(publishCourse(courseId)),
  retract: (courseId) => dispatch(retractCourse(courseId)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PreviewPageForExistingCourse);
