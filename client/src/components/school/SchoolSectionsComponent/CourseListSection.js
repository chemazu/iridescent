import axios from "axios";
import React, { useRef, useState, useEffect } from "react";
import { connect } from "react-redux";
import {
  Button,
  Modal,
  Label,
  FormGroup,
  UncontrolledCollapse,
} from "reactstrap";
import CurrencyFormat from "react-currency-format";
import setAuthToken from "../../../utilities/setAuthToken";
import roundToTwoDecimalPlaces from "../../../utilities/roundToTwoDecimalPlaces";
import { Link } from "react-router-dom";
import { useAlert } from "react-alert";

import "../SectionStyles/courselistsection.css";

const CourseListSection = ({
  themeData,
  isAuthenticated,
  coursesLoading,
  schoolCourses,
  isPreviewMode,
  backendSectionData,
  displayUpdateLoader,
  removeUpdateLoader,
  updateSectionAfterBackendSubmit,
  openAddNewSectionModal,
  handleSectionDelete,
  handleBackToDashboard,
  currency,
}) => {
  const courseListContainerRef = useRef();
  const alert = useAlert();
  const [displaySectionModal, setDisplaySectionModal] = useState(false);
  const [deleteModalConfirmation, setDeleteModalConfirmation] = useState(false);
  const [useSecondaryColorScheme, setUseSecondaryColorScheme] = useState(false);

  const toggleUseSecondaryColorScheme = () =>
    setUseSecondaryColorScheme(!useSecondaryColorScheme);

  const scroll = (scrollOffset) => {
    courseListContainerRef.current.scrollLeft += scrollOffset;
  };

  const addNewSectionModal = () => {
    openAddNewSectionModal(backendSectionData.position);
  };

  const handleDeleteBtnClick = () => {
    setDeleteModalConfirmation(false);
    handleSectionDelete(backendSectionData._id);
  };

  useEffect(() => {
    if (backendSectionData) {
      setUseSecondaryColorScheme(backendSectionData.isusingsecondarystyles);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (backendSectionData) {
      setUseSecondaryColorScheme(backendSectionData.isusingsecondarystyles);
    }
  }, [backendSectionData]);

  const handleBtnSaveUpdate = async () => {
    setDisplaySectionModal(false);
    displayUpdateLoader();
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
        useSecondaryColorScheme: useSecondaryColorScheme,
      });

      const res = await axios.put(
        `/api/v1/section/${backendSectionData._id}/courselist`,
        body,
        config
      );
      updateSectionAfterBackendSubmit(res.data);
      removeUpdateLoader();
    } catch (error) {
      removeUpdateLoader();
      console.log(error);
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

  return (
    <>
      <section
        style={{
          backgroundColor:
            backendSectionData.isusingsecondarystyles === true
              ? themeData.themestyles.secondarybackgroundcolor
              : themeData.themestyles.primarybackgroundcolor,
        }}
        className="school-course-list"
      >
        {isAuthenticated === true && isPreviewMode === true && (
          <>
            <div className="courselist-section-overlay">
              <div className="courselist-Controls text-center">
                <Button onClick={() => setDisplaySectionModal(true)} block>
                  Edit
                </Button>
                <Button
                  onClick={() => setDeleteModalConfirmation(true)}
                  disabled
                  block
                >
                  Delete
                </Button>
                <Button onClick={handleBackToDashboard} block>
                  Back To Dashboard
                </Button>
              </div>
              <div onClick={addNewSectionModal} className="add-section-btn">
                <i className="fas fa-plus"></i>
              </div>
            </div>
          </>
        )}
        <div className="courselist-container">
          <div className="header-controller__and__controls">
            <h3
              className="header"
              style={{
                color:
                  backendSectionData.isusingsecondarystyles === true
                    ? themeData.themestyles.secondarytextcolor
                    : themeData.themestyles.primarytextcolor,
                fontFamily: themeData.themestyles.fontfamily,
              }}
            >
              {themeData?.title?.length > 0
                ? `${themeData.title} Course List`
                : "School Title Course List"}
            </h3>
            <div className="controls">
              <div
                onClick={() => scroll(-30)}
                style={{
                  color:
                    backendSectionData.isusingsecondarystyles === true
                      ? themeData.themestyles.secondarytextcolor
                      : themeData.themestyles.primarytextcolor,
                }}
                className="left-arrow-control"
              >
                <i className="fas fa-arrow-left"></i>
              </div>
              <div
                onClick={() => scroll(30)}
                style={{
                  color:
                    backendSectionData.isusingsecondarystyles === true
                      ? themeData.themestyles.secondarytextcolor
                      : themeData.themestyles.primarytextcolor,
                }}
                className="right-arrow-control"
              >
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
          </div>
          <div
            ref={courseListContainerRef}
            className="course-item-container pl-3"
          >
            {coursesLoading ? (
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
                {schoolCourses.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      color:
                        backendSectionData.isusingsecondarystyles === true
                          ? themeData.themestyles.secondarytextcolor
                          : themeData.themestyles.primarytextcolor,
                      width: "100%",
                    }}
                    className="text-center mb-2 mt-2"
                  >
                    School Courses Not Found!
                  </p>
                ) : (
                  <>
                    {schoolCourses.map((courseItem) => {
                      return (
                        <div
                          className="course__item mb-3"
                          key={courseItem._id}
                          style={{
                            boxShadow:
                              themeData.themestyles.coursecardhasShadow === true
                                ? "0px 7px 29px 0px rgba(100, 100, 111, 0.2)"
                                : "none",
                          }}
                        >
                          <div className="item-img-container">
                            <Link to={`/preview/${courseItem._id}`}>
                              <img
                                src={courseItem.thumbnail}
                                alt="thumbnail img"
                              />
                            </Link>
                          </div>
                          <div
                            style={{
                              backgroundColor:
                                themeData.themestyles.coursecardbackgroundcolor,
                            }}
                            className="course-item__details-container"
                          >
                            <Link to={`/preview/${courseItem._id}`}>
                              <div
                                style={{
                                  color:
                                    themeData.themestyles.coursecardtextcolor,
                                  fontFamily: themeData.themestyles.fontfamily,
                                }}
                                title={courseItem.title}
                                className="course-item-name"
                              >
                                {courseItem.title}
                              </div>
                            </Link>
                            <div
                              style={{
                                color:
                                  themeData.themestyles.coursecardtextcolor,
                                fontFamily: themeData.themestyles.fontfamily,
                              }}
                              className="course-item-author-name"
                            >
                              {`${courseItem.author.firstname} ${courseItem.author.lastname}`}
                            </div>
                            <div
                              style={{
                                color:
                                  themeData.themestyles.coursecardtextcolor,
                                fontFamily: themeData.themestyles.fontfamily,
                                borderColor:
                                  themeData.themestyles.coursecardtextcolor,
                              }}
                              className="course-item-level mt-1"
                            >
                              {courseItem.level}
                            </div>
                            <div
                              style={{
                                color:
                                  themeData.themestyles.coursecardtextcolor,
                                fontFamily: themeData.themestyles.fontfamily,
                              }}
                              className="course-item-price"
                            >
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: currency.htmlCurrencySymbol,
                                }}
                              ></span>
                              <CurrencyFormat
                                value={roundToTwoDecimalPlaces(
                                  courseItem.price_usd * currency.exchangeRate
                                )}
                                displayType="text"
                                thousandSeparator={true}
                                decimalScale={2}
                                fixedDecimalScale={true}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </section>
      <Modal isOpen={displaySectionModal} size="md" centered>
        <div className="modal-header header-design">
          <h3>Update Section</h3>
          <div
            onClick={() => setDisplaySectionModal(false)}
            className="close-container"
          >
            <i className="fas fa-times"></i>
          </div>
        </div>
        <div className="modal-body">
          {/* modal body beginning  */}

          <div className="container-settings">
            <div id="update-header-toggler" className="toggle-action-launcher">
              <div className="toggle-action-text">
                Update CourseList Background
              </div>
              <div className="toggle-action-icon">
                <i className="fas fa-caret-down"></i>
              </div>
            </div>
            <UncontrolledCollapse toggler="#update-header-toggler">
              <FormGroup>
                <Label>Use Secondary Color Scheme:</Label>
                <div className="modal-checkbox-toggle">
                  <label class="modal-switch">
                    <input
                      type="checkbox"
                      value={useSecondaryColorScheme}
                      checked={useSecondaryColorScheme}
                      onChange={toggleUseSecondaryColorScheme}
                    />
                    <span class="modal-slider modal-round"></span>
                  </label>
                </div>
              </FormGroup>
            </UncontrolledCollapse>
          </div>
          {/* modal body ending  */}
        </div>
        <div className="modal-footer">
          <Button onClick={handleBtnSaveUpdate} className="save-button" block>
            Save
          </Button>
        </div>
      </Modal>

      {/* delete section modal starts here  */}
      <Modal
        className="modal-dialog-centered"
        isOpen={deleteModalConfirmation}
        size="md"
      >
        <div className="modal-header delete-section-modal">
          <h3>Delete Section</h3>
          <div onClick={() => setDeleteModalConfirmation(false)}>
            <i className="fas fa-times"></i>
          </div>
        </div>
        <div className="modal-body">
          <p className="text-center lead confirmation-text">
            Are you sure you want to Delete this section ?
          </p>
        </div>
        <div className="modal-footer">
          <Button
            block
            onClick={() => setDeleteModalConfirmation(false)}
            className="delete-confimation-cancel"
          >
            Cancel
          </Button>
          <Button
            block
            onClick={handleDeleteBtnClick}
            className="delete-confirmation-confirm"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => ({
  currency: state.currency,
});

export default connect(mapStateToProps)(CourseListSection);
