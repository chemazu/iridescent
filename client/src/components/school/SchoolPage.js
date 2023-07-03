import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import axios from "axios";
import Cookie from "js-cookie";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import setDocumentTitle from "../../utilities/setDocumentTitle";
import { loadUser } from "../../actions/auth";
import { useAlert } from "react-alert";
import { Modal, Button, Row, Col } from "reactstrap";
import setAuthToken from "../../utilities/setAuthToken";
import getUserIpAddress from "../../utilities/getUserIpAddress";

import SectionList from "./SectionList";

// sections component imported here
import CalltoActionSection from "./SchoolSectionsComponent/CalltoActionSection";
import ImageAndTextSection from "./SchoolSectionsComponent/ImageAndTextSection";
import ThreeColumnImageGallery from "./SchoolSectionsComponent/ThreeColumnImageGallery";
import TextOverlaySection from "./SchoolSectionsComponent/TextOverlaySection";
import VideoSection from "./SchoolSectionsComponent/VideoSection";
import HeaderTextAndImageSection from "./SchoolSectionsComponent/HeaderTextAndImageSection";
import HeaderTextHeroImageSection from "./SchoolSectionsComponent/HeaderTextHeroImageSection";
import TextAndChecklistSection from "./SchoolSectionsComponent/TextAndChecklistSection";
import CourseListSection from "./SchoolSectionsComponent/CourseListSection";
import ProductListSection from "./SchoolSectionsComponent/ProductListSection";
import SubdomainNotFoundPage from "../dashboard/Subdomain404";

// theme default components for basic structure
import AdminEditorsNavbar from "./SchoolLandingPageBasicComponents/AdminEditorsNavbar";
import SchoolPageNavbar from "./SchoolLandingPageBasicComponents/SchoolPageNavbar";
import Footer from "./SchoolLandingPageBasicComponents/Footer";

import "../../custom-styles/schoollandingpagecomponents/addsectionmodalstyles.css";
import "../../custom-styles/schoollandingpagecomponents/editmodalstyles.css";
import "../../custom-styles/schoollandingpagecomponents/pacmananimationstyles.css";
import LiveWebinarSection from "./SchoolSectionsComponent/LiveWebinarSection";

// all possible by names sectionnames
// 1. calltoaction
// 2. courselist
// 3. productlist
// 4. galleryimageurls
// 5. imageandtext
// 6. textoverlay
// 7. video
// 8. textandchecklist
// 9. headertextandimage
// 10. headertextheroimage
// 11. Live Webinar

export const SchoolPage = ({
  getLoggedInUser,
  user,
  userAuthenticated,
  schoolname,
}) => {
  const alert = useAlert();
  const [school, setSchool] = useState(null);
  const [theme, setTheme] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [showPageBuilderLoader, setShowPageBuilderLoader] = useState(false);
  const tutorToken = localStorage.getItem("token");
  const [
    addSectionUseSecondaryColorScheme,
    setAddSectionUseSecondaryColorScheme,
  ] = useState(false);

  const [displayAddNewSectionModal, setDisplayAddNewSectionModal] =
    useState(false);
  const [positionOfPreviousSection, setPositionOfPreviousSection] =
    useState(null);
  const [detailsOfSelectedSectionAddType, setDetailsOfSelectedSectionAddType] =
    useState(null);

  const openAddNewSectionModal = (previousPositionNumber) => {
    setDisplayAddNewSectionModal(true);
    setPositionOfPreviousSection(previousPositionNumber);
  };

  const closeAddNewSectionModal = () => {
    setDisplayAddNewSectionModal(false);
    setPositionOfPreviousSection(null);
    setDetailsOfSelectedSectionAddType(null);
  };

  const handleBackToDashboard = () => {
    const host = window.location.host;
    if (host.includes("localhost")) {
      window.location.href = "http://localhost:3000/dashboard/customize";
    } else {
      window.location.href = "https://www.tuturly.com/dashboard/customize";
    }
  };

  const [schoolCourses, setSchoolCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [schoolProducts, setSchoolProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [schoolSections, setSchoolSections] = useState([]);

  const togglePreviewMode = () => setIsPreviewMode(!isPreviewMode);

  const displayPageBuilderLoader = () => setShowPageBuilderLoader(true);
  const removePageBuilderLoader = () => setShowPageBuilderLoader(false);

  const toggleAddNewSectionUseSecondaryColorScheme = () =>
    setAddSectionUseSecondaryColorScheme(!addSectionUseSecondaryColorScheme);

  const getSchoolBySchoolName = async (schoolname) => {
    try {
      const res = await axios.get(`/api/v1/school/${schoolname}`);
      setSchool(res.data);
      return res.data;
    } catch (error) {
      if (error.response.status === 404) {
        setSchool(null);
        setPageLoading(false);
      }
      console.log(error.response.data.errors[0].msg);
      return null;
    }
  };

  const getSchoolThemeBySchoolId = async (schoolId) => {
    try {
      const res = await axios.get(`/api/v1/theme/${schoolId}`);
      setTheme(res.data);
    } catch (error) {
      if (error.response.status === 404) {
        setTheme(null);
        setPageLoading(false);
      }
      console.log(error.response.data.errors[0].msg);
      return null;
    }
  };

  const updateSchoolThemeBySchoolId = async (logoFile) => {
    try {
      displayPageBuilderLoader();
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const formData = new FormData();
      formData.append("logo", logoFile);
      const res = await axios.put(
        `/api/v1/theme/setup/themeinfo/image/${school._id}`,
        formData,
        config
      );
      setTheme({
        ...theme,
        ...res.data,
      });
      removePageBuilderLoader();
    } catch (error) {
      removePageBuilderLoader();
      const errros = error?.response?.data?.errors;
      console.log(error);
      if (errros) {
        return errros.forEach((error) =>
          alert.show(error.msg, { type: "error" })
        );
      }
      alert.show(error.message, { type: "error" });
    }
  };

  const getCoursesBySchoolName = async (schoolName) => {
    try {
      setCoursesLoading(true);
      const res = await axios.get(`/api/v1/school/courses/${schoolName}`);
      setCoursesLoading(false);
      setSchoolCourses(res.data);
    } catch (error) {
      const errros = error?.response?.data?.errors;
      if (errros) {
        errros.forEach((error) => alert.show(error.msg, { type: "error" }));
      }
      alert.show(error.message);
      console.log(error);
    }
  };

  const getProductsBySchoolName = async (schoolName) => {
    try {
      setProductsLoading(true);
      const res = await axios.get(`/api/v1/school/products/${schoolName}`);
      setSchoolProducts(res.data);
      setProductsLoading(false);
    } catch (error) {
      const errros = error?.response?.data?.errors;
      if (errros) {
        errros.forEach((error) => alert.show(error.msg, { type: "error" }));
      }
      alert.show(error.message);
      console.log(error);
    }
  };

  const getSchoolSectionsBySchoolId = async (schoolId) => {
    try {
      const res = await axios.get(`/api/v1/section/${schoolId}`);
      setSchoolSections(res.data);
    } catch (error) {
      const errros = error?.response?.data?.errors[0]?.msg;
      if (errros) {
        errros.forEach((error) => alert.show(error.msg, { type: "error" }));
      }
      alert.show(error.message);
      console.log(error);
    }
  };

  const getSchoolLandingPageContents = async (schoolName) => {
    setPageLoading(true);
    const school = await getSchoolBySchoolName(schoolName);
    if (school) {
      await getSchoolThemeBySchoolId(school._id);
      await getSchoolSectionsBySchoolId(school._id);
    }
    setPageLoading(false);
  };

  const updateSectionAfterBackendSubmit = (data) => {
    setSchoolSections(
      schoolSections.map((section) =>
        section._id === data._id ? { ...data } : section
      )
    );
  };

  const handleAddSectionClick = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    setDisplayAddNewSectionModal(false);
    displayPageBuilderLoader();
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const body = JSON.stringify({
        name: detailsOfSelectedSectionAddType.name,
        parenttheme: theme._id,
        previousSectionPosition: positionOfPreviousSection,
        isUsingSecondaryStyles: addSectionUseSecondaryColorScheme,
      });
      const res = await axios.post(
        `/api/v1/section/${school._id}`,
        body,
        config
      );
      setSchoolSections(res.data);
      removePageBuilderLoader();
      setAddSectionUseSecondaryColorScheme(false);
      setDetailsOfSelectedSectionAddType(null);
    } catch (error) {
      removePageBuilderLoader();
      const errors = error?.response?.data?.errors;
      if (errors) {
        errors.forEach((error) => {
          alert.show(error.msg, {
            type: "error",
          });
        });
      }
    }
  };

  const orderSectionListInBackend = async (list) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify({
        list,
      });
      await axios.put(`/api/v1/section/${school._id}/reorder`, body, config);
    } catch (error) {
      const errors = error?.response?.data?.errors;
      if (errors) {
        errors.forEach((error) => {
          alert.show(error.msg, {
            type: "error",
          });
        });
      }
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(schoolSections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSchoolSections(items);
    const reArrangedArraysToBeSent = items.map((item, index) => ({
      ...item,
      index,
    }));
    orderSectionListInBackend(reArrangedArraysToBeSent);
  };

  const handleSectionDelete = async (sectionId) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    displayPageBuilderLoader();
    try {
      const res = await axios.delete(
        `/api/v1/section/${school._id}/${sectionId}`
      );
      setSchoolSections(res.data);
      removePageBuilderLoader();
    } catch (error) {
      removePageBuilderLoader();
      const errors = error?.response?.data?.errors;
      if (errors) {
        errors.forEach((error) => {
          alert.show(error.msg, {
            type: "error",
          });
        });
      }
    }
  };

  const determineSectionToRenderBySectionName = (
    sectionName,
    backendData,
    index
  ) => {
    const sectionNameToLowerCase = sectionName.toLowerCase();
    console.log(sectionNameToLowerCase);
    switch (sectionNameToLowerCase) {
      case "calltoaction":
        return (
          <>
            {tutorToken !== null &&
            user !== null &&
            user.username.toLowerCase() === schoolname.toLowerCase() &&
            isPreviewMode === true ? (
              <Draggable
                key={backendData._id}
                draggableId={backendData._id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <CalltoActionSection
                      themeData={theme}
                      isAuthenticated={
                        tutorToken !== null &&
                        user !== null &&
                        user.username.toLowerCase() === schoolname.toLowerCase()
                      }
                      isPreviewMode={isPreviewMode}
                      backendSectionData={backendData}
                      displayUpdateLoader={displayPageBuilderLoader}
                      removeUpdateLoader={removePageBuilderLoader}
                      updateSectionAfterBackendSubmit={
                        updateSectionAfterBackendSubmit
                      }
                      openAddNewSectionModal={openAddNewSectionModal}
                      handleSectionDelete={handleSectionDelete}
                      handleBackToDashboard={handleBackToDashboard}
                    />
                  </div>
                )}
              </Draggable>
            ) : (
              <CalltoActionSection
                key={backendData._id}
                themeData={theme}
                isAuthenticated={
                  tutorToken !== null &&
                  user !== null &&
                  user.username.toLowerCase() === schoolname.toLowerCase()
                }
                isPreviewMode={isPreviewMode}
                backendSectionData={backendData}
                displayUpdateLoader={displayPageBuilderLoader}
                removeUpdateLoader={removePageBuilderLoader}
                updateSectionAfterBackendSubmit={
                  updateSectionAfterBackendSubmit
                }
                openAddNewSectionModal={openAddNewSectionModal}
                handleSectionDelete={handleSectionDelete}
                handleBackToDashboard={handleBackToDashboard}
              />
            )}
          </>
        );
      case "courselist":
        return (
          <>
            {tutorToken !== null &&
            user !== null &&
            user.username.toLowerCase() === schoolname.toLowerCase() &&
            isPreviewMode === true ? (
              <Draggable
                key={backendData._id}
                draggableId={backendData._id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <CourseListSection
                      themeData={theme}
                      isAuthenticated={
                        tutorToken !== null &&
                        user !== null &&
                        user.username.toLowerCase() === schoolname.toLowerCase()
                      }
                      isPreviewMode={isPreviewMode}
                      coursesLoading={coursesLoading}
                      backendSectionData={backendData}
                      schoolCourses={schoolCourses}
                      displayUpdateLoader={displayPageBuilderLoader}
                      removeUpdateLoader={removePageBuilderLoader}
                      updateSectionAfterBackendSubmit={
                        updateSectionAfterBackendSubmit
                      }
                      openAddNewSectionModal={openAddNewSectionModal}
                      handleSectionDelete={handleSectionDelete}
                      handleBackToDashboard={handleBackToDashboard}
                    />
                  </div>
                )}
              </Draggable>
            ) : (
              <CourseListSection
                key={backendData._id}
                themeData={theme}
                isAuthenticated={
                  tutorToken !== null &&
                  user !== null &&
                  user.username.toLowerCase() === schoolname.toLowerCase()
                }
                isPreviewMode={isPreviewMode}
                coursesLoading={coursesLoading}
                backendSectionData={backendData}
                schoolCourses={schoolCourses}
                displayUpdateLoader={displayPageBuilderLoader}
                removeUpdateLoader={removePageBuilderLoader}
                updateSectionAfterBackendSubmit={
                  updateSectionAfterBackendSubmit
                }
                openAddNewSectionModal={openAddNewSectionModal}
                handleSectionDelete={handleSectionDelete}
                handleBackToDashboard={handleBackToDashboard}
              />
            )}
          </>
        );
      case "productlist":
        return (
          <>
            {schoolProducts.length > 0 && (
              <>
                {tutorToken !== null &&
                user !== null &&
                user.username.toLowerCase() === schoolname.toLowerCase() &&
                isPreviewMode === true ? (
                  <Draggable
                    key={backendData._id}
                    draggableId={backendData._id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <ProductListSection
                          themeData={theme}
                          isAuthenticated={
                            tutorToken !== null &&
                            user !== null &&
                            user.username.toLowerCase() ===
                              schoolname.toLowerCase()
                          }
                          isPreviewMode={isPreviewMode}
                          productsLoading={productsLoading}
                          schoolProducts={schoolProducts}
                          backendSectionData={backendData}
                          displayUpdateLoader={displayPageBuilderLoader}
                          removeUpdateLoader={removePageBuilderLoader}
                          updateSectionAfterBackendSubmit={
                            updateSectionAfterBackendSubmit
                          }
                          openAddNewSectionModal={openAddNewSectionModal}
                          handleSectionDelete={handleSectionDelete}
                          handleBackToDashboard={handleBackToDashboard}
                        />
                      </div>
                    )}
                  </Draggable>
                ) : (
                  <ProductListSection
                    themeData={theme}
                    isAuthenticated={
                      tutorToken !== null &&
                      user !== null &&
                      user.username.toLowerCase() === schoolname.toLowerCase()
                    }
                    isPreviewMode={isPreviewMode}
                    productsLoading={productsLoading}
                    schoolProducts={schoolProducts}
                    backendSectionData={backendData}
                    displayUpdateLoader={displayPageBuilderLoader}
                    removeUpdateLoader={removePageBuilderLoader}
                    updateSectionAfterBackendSubmit={
                      updateSectionAfterBackendSubmit
                    }
                    openAddNewSectionModal={openAddNewSectionModal}
                    handleSectionDelete={handleSectionDelete}
                    handleBackToDashboard={handleBackToDashboard}
                  />
                )}
              </>
            )}
          </>
        );
      case "galleryimageurls":
        return (
          <>
            {tutorToken !== null &&
            user !== null &&
            user.username.toLowerCase() === schoolname.toLowerCase() &&
            isPreviewMode === true ? (
              <Draggable
                key={backendData._id}
                draggableId={backendData._id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <ThreeColumnImageGallery
                      themeData={theme}
                      isAuthenticated={
                        tutorToken !== null &&
                        user !== null &&
                        user.username.toLowerCase() === schoolname.toLowerCase()
                      }
                      isPreviewMode={isPreviewMode}
                      backendSectionData={backendData}
                      displayUpdateLoader={displayPageBuilderLoader}
                      removeUpdateLoader={removePageBuilderLoader}
                      updateSectionAfterBackendSubmit={
                        updateSectionAfterBackendSubmit
                      }
                      openAddNewSectionModal={openAddNewSectionModal}
                      handleSectionDelete={handleSectionDelete}
                      handleBackToDashboard={handleBackToDashboard}
                    />
                  </div>
                )}
              </Draggable>
            ) : (
              <ThreeColumnImageGallery
                key={backendData._id}
                themeData={theme}
                isAuthenticated={
                  tutorToken !== null &&
                  user !== null &&
                  user.username.toLowerCase() === schoolname.toLowerCase()
                }
                isPreviewMode={isPreviewMode}
                backendSectionData={backendData}
                displayUpdateLoader={displayPageBuilderLoader}
                removeUpdateLoader={removePageBuilderLoader}
                updateSectionAfterBackendSubmit={
                  updateSectionAfterBackendSubmit
                }
                openAddNewSectionModal={openAddNewSectionModal}
                handleSectionDelete={handleSectionDelete}
                handleBackToDashboard={handleBackToDashboard}
              />
            )}
          </>
        );
      case "imageandtext":
        return (
          <>
            {tutorToken !== null &&
            user !== null &&
            user.username.toLowerCase() === schoolname.toLowerCase() &&
            isPreviewMode === true ? (
              <Draggable
                key={backendData._id}
                draggableId={backendData._id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <ImageAndTextSection
                      themeData={theme}
                      isAuthenticated={
                        tutorToken !== null &&
                        user !== null &&
                        user.username.toLowerCase() === schoolname.toLowerCase()
                      }
                      isPreviewMode={isPreviewMode}
                      backendSectionData={backendData}
                      displayUpdateLoader={displayPageBuilderLoader}
                      removeUpdateLoader={removePageBuilderLoader}
                      updateSectionAfterBackendSubmit={
                        updateSectionAfterBackendSubmit
                      }
                      openAddNewSectionModal={openAddNewSectionModal}
                      handleSectionDelete={handleSectionDelete}
                      handleBackToDashboard={handleBackToDashboard}
                    />
                  </div>
                )}
              </Draggable>
            ) : (
              <ImageAndTextSection
                key={backendData._id}
                themeData={theme}
                isAuthenticated={
                  tutorToken !== null &&
                  user !== null &&
                  user.username.toLowerCase() === schoolname.toLowerCase()
                }
                isPreviewMode={isPreviewMode}
                backendSectionData={backendData}
                displayUpdateLoader={displayPageBuilderLoader}
                removeUpdateLoader={removePageBuilderLoader}
                updateSectionAfterBackendSubmit={
                  updateSectionAfterBackendSubmit
                }
                openAddNewSectionModal={openAddNewSectionModal}
                handleSectionDelete={handleSectionDelete}
                handleBackToDashboard={handleBackToDashboard}
              />
            )}
          </>
        );
      case "textimageoverlay":
        return (
          <>
            {tutorToken !== null &&
            user !== null &&
            user.username.toLowerCase() === schoolname.toLowerCase() &&
            isPreviewMode === true ? (
              <Draggable
                key={backendData._id}
                draggableId={backendData._id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TextOverlaySection
                      themeData={theme}
                      isAuthenticated={
                        tutorToken !== null &&
                        user !== null &&
                        user.username.toLowerCase() === schoolname.toLowerCase()
                      }
                      isPreviewMode={isPreviewMode}
                      backendSectionData={backendData}
                      displayUpdateLoader={displayPageBuilderLoader}
                      removeUpdateLoader={removePageBuilderLoader}
                      updateSectionAfterBackendSubmit={
                        updateSectionAfterBackendSubmit
                      }
                      openAddNewSectionModal={openAddNewSectionModal}
                      handleSectionDelete={handleSectionDelete}
                      handleBackToDashboard={handleBackToDashboard}
                    />
                  </div>
                )}
              </Draggable>
            ) : (
              <TextOverlaySection
                key={backendData._id}
                themeData={theme}
                isAuthenticated={
                  tutorToken !== null &&
                  user !== null &&
                  user.username.toLowerCase() === schoolname.toLowerCase()
                }
                isPreviewMode={isPreviewMode}
                backendSectionData={backendData}
                displayUpdateLoader={displayPageBuilderLoader}
                removeUpdateLoader={removePageBuilderLoader}
                updateSectionAfterBackendSubmit={
                  updateSectionAfterBackendSubmit
                }
                openAddNewSectionModal={openAddNewSectionModal}
                handleSectionDelete={handleSectionDelete}
                handleBackToDashboard={handleBackToDashboard}
              />
            )}
          </>
        );
      case "video":
        return (
          <>
            {tutorToken !== null &&
            user !== null &&
            user.username.toLowerCase() === schoolname.toLowerCase() &&
            isPreviewMode === true ? (
              <Draggable
                key={backendData._id}
                draggableId={backendData._id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <VideoSection
                      themeData={theme}
                      isAuthenticated={
                        tutorToken !== null &&
                        user !== null &&
                        user.username.toLowerCase() === schoolname.toLowerCase()
                      }
                      isPreviewMode={isPreviewMode}
                      backendSectionData={backendData}
                      displayUpdateLoader={displayPageBuilderLoader}
                      removeUpdateLoader={removePageBuilderLoader}
                      updateSectionAfterBackendSubmit={
                        updateSectionAfterBackendSubmit
                      }
                      openAddNewSectionModal={openAddNewSectionModal}
                      handleSectionDelete={handleSectionDelete}
                      handleBackToDashboard={handleBackToDashboard}
                    />
                  </div>
                )}
              </Draggable>
            ) : (
              <VideoSection
                key={backendData._id}
                themeData={theme}
                isAuthenticated={
                  tutorToken !== null &&
                  user !== null &&
                  user.username.toLowerCase() === schoolname.toLowerCase()
                }
                isPreviewMode={isPreviewMode}
                backendSectionData={backendData}
                displayUpdateLoader={displayPageBuilderLoader}
                removeUpdateLoader={removePageBuilderLoader}
                updateSectionAfterBackendSubmit={
                  updateSectionAfterBackendSubmit
                }
                openAddNewSectionModal={openAddNewSectionModal}
                handleSectionDelete={handleSectionDelete}
                handleBackToDashboard={handleBackToDashboard}
              />
            )}
          </>
        );
      case "textandchecklist":
        return (
          <>
            {tutorToken !== null &&
            user !== null &&
            user.username.toLowerCase() === schoolname.toLowerCase() &&
            isPreviewMode === true ? (
              <Draggable
                key={backendData._id}
                draggableId={backendData._id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TextAndChecklistSection
                      themeData={theme}
                      isAuthenticated={
                        tutorToken !== null &&
                        user !== null &&
                        user.username.toLowerCase() === schoolname.toLowerCase()
                      }
                      isPreviewMode={isPreviewMode}
                      backendSectionData={backendData}
                      displayUpdateLoader={displayPageBuilderLoader}
                      removeUpdateLoader={removePageBuilderLoader}
                      updateSectionAfterBackendSubmit={
                        updateSectionAfterBackendSubmit
                      }
                      openAddNewSectionModal={openAddNewSectionModal}
                      handleSectionDelete={handleSectionDelete}
                      handleBackToDashboard={handleBackToDashboard}
                    />
                  </div>
                )}
              </Draggable>
            ) : (
              <TextAndChecklistSection
                key={backendData._id}
                themeData={theme}
                isAuthenticated={
                  tutorToken !== null &&
                  user !== null &&
                  user.username.toLowerCase() === schoolname.toLowerCase()
                }
                isPreviewMode={isPreviewMode}
                backendSectionData={backendData}
                displayUpdateLoader={displayPageBuilderLoader}
                removeUpdateLoader={removePageBuilderLoader}
                updateSectionAfterBackendSubmit={
                  updateSectionAfterBackendSubmit
                }
                openAddNewSectionModal={openAddNewSectionModal}
                handleSectionDelete={handleSectionDelete}
                handleBackToDashboard={handleBackToDashboard}
              />
            )}
          </>
        );
      case "headertextandimage":
        return (
          <>
            {tutorToken !== null &&
            user !== null &&
            user.username.toLowerCase() === schoolname.toLowerCase() &&
            isPreviewMode === true ? (
              <Draggable
                key={backendData._id}
                draggableId={backendData._id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <HeaderTextAndImageSection
                      themeData={theme}
                      isAuthenticated={
                        tutorToken !== null &&
                        user !== null &&
                        user.username.toLowerCase() === schoolname.toLowerCase()
                      }
                      isPreviewMode={isPreviewMode}
                      backendSectionData={backendData}
                      displayUpdateLoader={displayPageBuilderLoader}
                      removeUpdateLoader={removePageBuilderLoader}
                      updateSectionAfterBackendSubmit={
                        updateSectionAfterBackendSubmit
                      }
                      openAddNewSectionModal={openAddNewSectionModal}
                      handleSectionDelete={handleSectionDelete}
                      handleBackToDashboard={handleBackToDashboard}
                    />
                  </div>
                )}
              </Draggable>
            ) : (
              <HeaderTextAndImageSection
                key={backendData._id}
                themeData={theme}
                isAuthenticated={
                  tutorToken !== null &&
                  user !== null &&
                  user.username.toLowerCase() === schoolname.toLowerCase()
                }
                isPreviewMode={isPreviewMode}
                backendSectionData={backendData}
                displayUpdateLoader={displayPageBuilderLoader}
                removeUpdateLoader={removePageBuilderLoader}
                updateSectionAfterBackendSubmit={
                  updateSectionAfterBackendSubmit
                }
                openAddNewSectionModal={openAddNewSectionModal}
                handleSectionDelete={handleSectionDelete}
                handleBackToDashboard={handleBackToDashboard}
              />
            )}
          </>
        );
      case "headertextheroimage":
        return (
          <>
            {tutorToken !== null &&
            user !== null &&
            user.username.toLowerCase() === schoolname.toLowerCase() &&
            isPreviewMode === true ? (
              <Draggable
                key={backendData._id}
                draggableId={backendData._id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <HeaderTextHeroImageSection
                      themeData={theme}
                      isAuthenticated={
                        tutorToken !== null &&
                        user !== null &&
                        user.username.toLowerCase() === schoolname.toLowerCase()
                      }
                      isPreviewMode={isPreviewMode}
                      backendSectionData={backendData}
                      displayUpdateLoader={displayPageBuilderLoader}
                      removeUpdateLoader={removePageBuilderLoader}
                      updateSectionAfterBackendSubmit={
                        updateSectionAfterBackendSubmit
                      }
                      openAddNewSectionModal={openAddNewSectionModal}
                      handleSectionDelete={handleSectionDelete}
                      handleBackToDashboard={handleBackToDashboard}
                    />
                  </div>
                )}
              </Draggable>
            ) : (
              <HeaderTextHeroImageSection
                key={backendData._id}
                themeData={theme}
                isAuthenticated={
                  tutorToken !== null &&
                  user !== null &&
                  user.username.toLowerCase() === schoolname.toLowerCase()
                }
                isPreviewMode={isPreviewMode}
                backendSectionData={backendData}
                displayUpdateLoader={displayPageBuilderLoader}
                removeUpdateLoader={removePageBuilderLoader}
                updateSectionAfterBackendSubmit={
                  updateSectionAfterBackendSubmit
                }
                openAddNewSectionModal={openAddNewSectionModal}
                handleSectionDelete={handleSectionDelete}
                handleBackToDashboard={handleBackToDashboard}
              />
            )}
          </>
        );
      default:
        return <p className="lead mt-3 mb-3">Section Not Found!</p>;
    }
  };

  const recordSchoolLandingPageVisit = async (schoolname) => {
    try {
      const userIp = await getUserIpAddress();
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify({
        ipaddress: userIp,
        schoolname: schoolname,
      });
      await axios.post("/api/v1/pagevisit", body, config);
    } catch (error) {
      const errors = error?.response?.data?.errors;
      if (errors) {
        errors.forEach((error) => {
          alert.show(error.msg, {
            type: "error",
          });
        });
      }
    }
  };

  useEffect(() => {
    if (schoolname.length > 0) {
      getSchoolLandingPageContents(schoolname);
      getCoursesBySchoolName(schoolname);
      getProductsBySchoolName(schoolname);
      recordSchoolLandingPageVisit(schoolname);
      const tokenFromCookie = Cookie.get("adminCookie");
      if (tokenFromCookie) {
        localStorage.setItem("token", tokenFromCookie);
      } else if (
        window.location.host.includes("localhost") === false &&
        tokenFromCookie === null
      ) {
        localStorage.removeItem("token");
      }
      getLoggedInUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolname]);

  useEffect(() => {
    if (school) {
      setDocumentTitle(school);
    }
  }, [school]);

  useEffect(() => {
    if (theme) {
      if (theme.favicon.length > 0) {
        document.querySelector("link[rel*='icon']").href = theme.favicon;
      }
    }
  }, [theme]);

  return (
    <>
      {pageLoading === true ? (
        <div
          style={{
            width: "50%",
            margin: "20px auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i
            style={{ fontSize: "22px" }}
            className="fas fa-circle-notch fa-spin"
          ></i>
        </div>
      ) : (
        <>
          {/* styles are kept in the school page navbar css file */}
          <div className="page-wrapper">
            {!pageLoading && school === null && theme === null ? (
              <SubdomainNotFoundPage schoolName={schoolname} school={school} />
            ) : (
              <>
                {tutorToken !== null &&
                  user !== null &&
                  user.username.toLowerCase() === schoolname.toLowerCase() && (
                    <AdminEditorsNavbar
                      togglePreviewMode={togglePreviewMode}
                      isPreviewMode={isPreviewMode}
                      schoolname={schoolname}
                    />
                  )}
                <SchoolPageNavbar
                  theme={theme}
                  updateSchoolThemeBySchoolId={updateSchoolThemeBySchoolId}
                  schoolName={schoolname}
                  isPreviewMode={isPreviewMode}
                  isShowingEditorNavbar={
                    tutorToken !== null &&
                    user !== null &&
                    user.username.toLowerCase() === schoolname.toLowerCase()
                  }
                />
                {
                  <>
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="sections">
                        {(provided) => {
                          return (
                            <>
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                              >
                                {schoolSections.length === 0 ? (
                                  <p className="lead text-center mt-3 mb-3"></p>
                                ) : (
                                  <>
                                    {schoolSections.map(
                                      (sectionData, index) => {
                                        return determineSectionToRenderBySectionName(
                                          sectionData.name,
                                          sectionData,
                                          index
                                        );
                                      }
                                    )}
                                  </>
                                )}
                                {provided.placeholder}
                              </div>
                              <LiveWebinarSection
                                schoolname={schoolname}
                                theme={theme}
                      
                              />
                            </>
                          );
                        }}
                      </Droppable>
                    </DragDropContext>
                  </>
                }
                <Footer theme={theme} schoolName={schoolname} />
              </>
            )}
          </div>
        </>
      )}

      {/* page builder loading modal  */}
      <Modal
        isOpen={showPageBuilderLoader}
        contentClassName="page-builder-modal-style"
        centered
        size="xl"
        backdrop
        fade
      >
        <div className="modal-body">
          <div class="la-ball-fall la-3x">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </Modal>

      {/* add section modal  */}
      <Modal isOpen={displayAddNewSectionModal} size="lg" backdrop fade>
        <div className="modal-header add-section-modal">
          <h3>Add Section</h3>
          <div
            className="close-add-section__modal"
            onClick={closeAddNewSectionModal}
          >
            <i className="fas fa-times"></i>
          </div>
        </div>
        <div className="modal-body">
          <h3 className="add-section-modal-title text-center mb-4">
            Select The Section You Wish To Add.
          </h3>
          <div className="section-preview-container">
            <Row>
              {SectionList.map((sectionItem) => {
                return (
                  <Col
                    xs="12"
                    sm="6"
                    md="6"
                    lg="4"
                    className="col-custom__style mb-2"
                    key={sectionItem.id}
                  >
                    <div
                      onClick={() =>
                        setDetailsOfSelectedSectionAddType(sectionItem)
                      }
                      className={`add-section-preview-item ${
                        detailsOfSelectedSectionAddType !== null &&
                        detailsOfSelectedSectionAddType.id === sectionItem.id &&
                        "selected-new-section"
                      }`}
                    >
                      <div className="add-section-preview-item__image">
                        <img src={sectionItem.previewImage} alt="..." />
                      </div>
                    </div>
                    <p className="text-center mt-2 new-section-item__name">
                      {sectionItem.displayName}
                    </p>
                    {detailsOfSelectedSectionAddType !== null &&
                      detailsOfSelectedSectionAddType.id === sectionItem.id && (
                        <>
                          <div className="add-section__controls">
                            <div className="modal-checkbox-toggle">
                              <p className="color-scheme-instructions">
                                Colour Scheme
                              </p>
                              <label class="modal-switch">
                                <input
                                  type="checkbox"
                                  value={addSectionUseSecondaryColorScheme}
                                  checked={addSectionUseSecondaryColorScheme}
                                  onChange={
                                    toggleAddNewSectionUseSecondaryColorScheme
                                  }
                                />
                                <span class="modal-slider modal-slider-require-text modal-round"></span>
                              </label>
                            </div>
                            <Button
                              onClick={handleAddSectionClick}
                              block
                              disabled={
                                detailsOfSelectedSectionAddType === null
                              }
                              className="add-section__save-btn"
                            >
                              Add
                            </Button>
                          </div>
                        </>
                      )}
                  </Col>
                );
              })}
            </Row>
          </div>
        </div>
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => ({
  user: state.auth.user,
  userAuthenticated: state.auth.authenticated,
  schoolname: state.subdomain,
});

const mapDispatchToProps = (dispatch) => ({
  getLoggedInUser: () => dispatch(loadUser()),
});

export default connect(mapStateToProps, mapDispatchToProps)(SchoolPage);
