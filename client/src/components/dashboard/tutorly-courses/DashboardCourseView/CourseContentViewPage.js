import React, { useState, useMemo, useRef, useEffect } from "react";
import axios from "axios";
import { useStore } from "react-redux";
import { useDispatch } from "react-redux";
import { useAlert } from "react-alert";
import {
  Container,
  Row,
  Col,
  Nav,
  NavItem,
  NavLink,
  Card,
  CardBody,
  TabContent,
  TabPane,
  Button,
} from "reactstrap";
import VideoPlayerSkeleton from "../../../school/VideoPlayerSkeleton";
import { CircularProgressbar } from "react-circular-progressbar";
import { Element, scroller } from "react-scroll";
import format from "../../../../utilities/format";
import VideoJS from "../../../VideoJSPlayer/VideoJS";
import setAuthToken from "../../../../utilities/setAuthToken";
import SecondaryPagesNavbar from "../SecondaryPagesNavbar";
import TutorModuleItemInPageContent from "./TutorModuleItemInPageContent";
import TutorNotesContainerInStudentDashboard from "./TutorNotesContainerInStudentDashboard";
import TutorAttachmentInStudentDashboard from "./TutorAttachmentInStudentDashboard";
import TutorDiscussionContainerInStudentDashboard from "./TutorDiscussionContainerInStudentDashboard";
import TutorCourseInfo from "./TutorCourseInfo";
import setDocumentTitle from "../../../../utilities/setDocumentTitle";
import { studentAuth } from "../../../../actions/student";

import "../../../../custom-styles/dashboard/tuturly-courses/course-content-view-page.css";
import "../../../../custom-styles/schoollandingpagecomponents/pacmananimationstyles.css";
import "react-circular-progressbar/dist/styles.css";

const CourseContentViewPage = ({ match }) => {
  const store = useStore();
  const state = store.getState();
  const schoolname = state.subdomain;

  // video player state
  const [videoPlayerState, setVideoPlayerState] = useState({
    playing: false,
    muted: false,
    volume: 0.5,
    playbackRate: 1.0,
    played: 0,
    seeking: false,
  });

  const { playing, volume } = videoPlayerState;
  const [timeDisplayFormat] = useState("normal");
  const [school, setSchool] = useState(null);

  const videoJsPlayerRef = useRef(null);
  const playerRef = useRef(null);
  const alert = useAlert();

  const [pageLoading, setPageLoading] = useState(false);
  const dispatch = useDispatch();
  const [course, setCourse] = useState(null); // course state data
  // eslint-disable-next-line
  const [courseLoading, setCourseLoading] = useState(true); // course loading state data

  const [courseUnitLoading, setCourseUnitLoading] = useState(true); // unitloading data
  const [courseUnit, setCourseUnit] = useState(null); // unit state data

  const [courseModulesLoading, setCourseModulesLoading] = useState(true); //modules lodaing state data
  const [courseModules, setCourseModules] = useState([]); // modules actual data

  const [courseUnitNotesCounter, setCourseUnitNotesCounter] = useState(0);
  const [courseUnitCommentsCounter, setCourseUnitCommentCounter] = useState(0);

  const [nextVideoLoading, setNextVideoLoading] = useState(false);
  const [nextVideoDelay, setNextVideoDelay] = useState(false);
  const [detailsOfNextVideo, setDetailsOfNextVideo] = useState(null);
  const [perentageCount, setPercentageCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [tabs, setTabs] = useState(1);
  const toggleNavs = (e, index) => {
    e.preventDefault();
    setTabs(index);
  };

  // const currentTime = videoJsPlayerRef.current
  //   ? videoJsPlayerRef.current.currentTime()
  //   : "00:00"; // the actual time in seconds that the player has played

  const duration = courseUnit !== null ? courseUnit.duration : "00:00"; // the total time of the video

  const elaspedTime =
    timeDisplayFormat === "normal"
      ? format(currentTime)
      : `-${format(duration - currentTime)}`; // human readable format for the current time

  // page contents controls below
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

  const [interValId, setInterValId] = useState(null);

  let videoDelayCountInterVal; // variable used to hold interval loader for next video

  const handleCancelNextVideoLoad = () => {
    clearInterval(interValId);
    setNextVideoDelay(false);
    setNextVideoLoading(false);
    setPercentageCount(0);

    setVideoPlayerState({
      ...videoPlayerState,
      playing: false,
    });
  };

  const loadNextVideoOnVideoEnd = async (moduleId, positionOfCurrentVideo) => {
    try {
      if (localStorage.getItem("studentToken")) {
        setAuthToken(localStorage.getItem("studentToken"));
      }
      const res = await axios.get(
        `/api/v1/studentcourse/next/${moduleId}/${positionOfCurrentVideo}`
      );
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const updateBody = {
        coursemoduleinview: res.data.coursechapter,
        courseunitlastviewed: res.data._id,
        unitprogresstimestamp: 0,
      };
      const body = JSON.stringify(updateBody);
      // code to update the tracking details in the backend with the loaded course unit data
      const updateRes = await axios.put(
        `/api/v1/studentcourse/${schoolname}/${course._id}`,
        body,
        config
      );
      // update course state with the new data
      setCourse({
        ...course,
        ...updateRes.data,
      });
      setCourseUnit(res.data);
      setNextVideoLoading(false);
      setNextVideoDelay(false);
    } catch (error) {
      setNextVideoLoading(false);
      alert.show(error.message, {
        type: "error",
      });
      console.log(error);
    }
  };

  const scrollToVideo = () => {
    scroller.scrollTo("video-player-div", {
      duration: 800,
      delay: 7,
      smooth: true,
      offset: -40,
    });
  };

  const pauseVideoOnCourseUnitChange = () => {
    if (playing === true) {
      setVideoPlayerState({
        ...videoPlayerState,
        playing: false,
      });
    }
  };

  const updateCourseUnitNoteCounter = (count) => {
    setCourseUnitNotesCounter(count);
  };

  const updateCourseUnitCommentsCounter = (count) => {
    setCourseUnitCommentCounter(count);
  };

  const updateOrTrackStudentProgress = async (
    schoolname,
    studentBoughtCourseId,
    updateBody
  ) => {
    if (localStorage.getItem("studentToken")) {
      setAuthToken(localStorage.getItem("studentToken"));
    }
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify(updateBody);
    try {
      const res = await axios.put(
        `/api/v1/studentcourse/${schoolname}/${studentBoughtCourseId}`,
        body,
        config
      );
      return res.data;
    } catch (error) {
      console.log(error);
    }
  };

  const getModuleFromCurrentCourseUnit = (moduleId) => {
    const currentModule = courseModules.find(
      (moduleItem) => moduleItem._id === moduleId
    );
    return currentModule;
  };

  const determineIfUnitIsLastUnitInModule = (moduleItem, courseUnit) => {
    const lastItemInModule =
      moduleItem.courseunit[moduleItem.courseunit.length - 1];
    return courseUnit._id === lastItemInModule._id;
  };

  const handleVideoEndForNextPlay = (moduleId, positionOfCurrentVideo) => {
    const currentModule = getModuleFromCurrentCourseUnit(
      courseUnit.coursechapter
    );
    const isLastUnitInModule = determineIfUnitIsLastUnitInModule(
      currentModule,
      courseUnit
    );

    if (isLastUnitInModule) {
      return alert.show("Course Module Completed", {
        type: "success",
      });
    }

    const detailsOfNextModule = currentModule.courseunit.find(
      (unitInfo) => unitInfo.position === parseInt(courseUnit.position) + 1
    );
    setDetailsOfNextVideo(detailsOfNextModule);

    setNextVideoDelay(true);
    const secondsToCount = 5;
    let countCurrentState = 0;

    videoDelayCountInterVal = setInterval(() => {
      countCurrentState++;
      const percentage = Math.floor((100 / secondsToCount) * countCurrentState);
      setPercentageCount(percentage);

      if (secondsToCount === countCurrentState) {
        clearInterval(videoDelayCountInterVal);
        setNextVideoLoading(true);
        loadNextVideoOnVideoEnd(moduleId, positionOfCurrentVideo);
        setPercentageCount(0);
      }
    }, 1000);
    setInterValId(videoDelayCountInterVal);
  };

  // video JS controls and options
  const videoJsOptions = useMemo(() => {
    const options = {
      autoplay: false,
      controls: true,
      responsive: true,
      fill: true,
      playbackRates: [0.5, 1, 1.5, 2],
      controlBar: {
        remainingTimeDisplay: {
          displayNegative: false,
        },
      },
      plugins: {
        seekButtons: {
          forward: 10,
          back: 10,
        },
      },
      videotitle: courseUnit?.name,
      sources:
        courseUnit?.isCloudflareVideoSource !== true
          ? [
              {
                src: courseUnit?.videourl,
                type: "video/mp4",
              },
              {
                src: courseUnit?.webmvideourl,
                type: "video/webm",
              },
              {
                src: courseUnit?.ogvvideourl,
                type: "video/ogg",
              },
            ]
          : [
              {
                src: courseUnit?.cloudflare_hsl_videourl,
                type: "application/x-mpegURL",
              },
              {
                src: courseUnit?.cloudflare_dash_videourl,
                type: "application/dash+xml",
              },
            ],
    };
    return options;
  }, [courseUnit]);

  const handleVideoJsPlayerReady = (player) => {
    videoJsPlayerRef.current = player;

    player?.on("waiting", () => {});

    player?.on("pause", () => {
      const progressUpdateData = {
        coursemoduleinview: courseUnit?.coursechapter,
        courseunitlastviewed: courseUnit?._id,
        unitprogresstimestamp: player.currentTime(),
      };
      updateOrTrackStudentProgress(schoolname, course._id, progressUpdateData);
    });

    player?.on("timeupdate", () => {
      setCurrentTime(player.currentTime());
    });

    player?.on("ended", () => {
      handleVideoEndForNextPlay(courseUnit.coursechapter, courseUnit.position);
    });

    player?.on("dispose", () => {});
  };

  const loadCourseUnitOnUnitItemClick = async (courseunitId) => {
    try {
      if (localStorage.getItem("studentToken")) {
        setAuthToken(localStorage.getItem("studentToken"));
      }
      if (courseUnitLoading === false) {
        setCourseUnitLoading(true);
      }
      const res = await axios.get(
        `/api/v1/studentcourse/courseunit/load/${courseunitId}`
      );
      // code to reset the tracking back to the information
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const updateBody = {
        coursemoduleinview: res.data.coursechapter,
        courseunitlastviewed: res.data._id,
        unitprogresstimestamp: 0,
      };
      const body = JSON.stringify(updateBody);
      // code to update the tracking details in the backend with the loaded course unit data
      const updateRes = await axios.put(
        `/api/v1/studentcourse/${schoolname}/${course._id}`,
        body,
        config
      );
      // update course state with the new data
      setCourse({
        ...course,
        ...updateRes.data,
      });
      setCourseUnit(res.data);
      setCourseUnitLoading(false);
    } catch (error) {
      setCourseUnitLoading(false);
      setCourseUnit(null);
      console.log(error);
    }
  };

  const getAllPageCourseAndModules = async (schoolname, purchaseCourseId) => {
    try {
      if (localStorage.getItem("studentToken")) {
        setAuthToken(localStorage.getItem("studentToken"));
      }
      const courseRes = await axios.get(
        `/api/v1/studentcourse/${schoolname}/${purchaseCourseId}`
      );
      const modulesRes = await axios.get(
        `/api/v1/studentcourse/${schoolname}/modules/${courseRes.data.coursebought._id}`
      );
      setCourse(courseRes.data);
      setCourseModules(modulesRes.data);
      setCourseLoading(false);
      setCourseModulesLoading(false);

      if (
        courseRes.data.coursemoduleinview === null ||
        courseRes.data.courseunitlastviewed === null
      ) {
        // the id of the first courseunit of the first course module would be loaded here
        const courseUnitRes = await axios.get(
          `/api/v1/studentcourse/courseunit/load/${modulesRes.data[0]?.courseunit[0]?._id}`
        );
        setCourseUnit(courseUnitRes.data);
        setCourseUnitLoading(false);
      } else {
        const courseUnitRes = await axios.get(
          `/api/v1/studentcourse/courseunit/load/${courseRes.data.courseunitlastviewed}`
        );
        setCourseUnit(courseUnitRes.data);
        setCourseUnitLoading(false);
      }
    } catch (error) {
      if (error.response.status === 404) {
        setCourse(null);
        setCourseLoading(false);
      }
      setCourseLoading(false);
      setCourseModules([]);
      setCourseModulesLoading(false);
      console.log(error);
    }
  };

  const getSchoolLandingPageContents = async (schoolName, courseId) => {
    setPageLoading(true);
    const school = await getSchoolBySchoolName(schoolName);
    if (school) {
      await getAllPageCourseAndModules(schoolName, courseId);
    }
    setPageLoading(false);
  };

  const handleKeydownEventListener = (e) => {
    const keyCode = e.code.toLowerCase();
    switch (keyCode) {
      case "space":
        // handlePlayPauseKeyBoardEvents(e);
        break;
      case "arrowright":
        e.preventDefault();
        handleFastForward();
        break;
      case "arrowleft":
        e.preventDefault();
        handleRewind();
        break;
      case "arrowup":
        e.preventDefault();
        onVolumeIncrease();
        break;
      case "arrowdown":
        e.preventDefault();
        onVolumeDecrease();
        break;
      default:
        break;
    }
  };

  const onVolumeIncrease = () => {
    if (volume <= 0.9) {
      setVideoPlayerState({
        ...videoPlayerState,
        volume: parseFloat(volume + parseFloat(0.1)),
      });
    }
  };

  const onVolumeDecrease = () => {
    if (volume >= 0.1) {
      setVideoPlayerState({
        ...videoPlayerState,
        volume: parseFloat(volume - parseFloat(0.1)),
      });
    }
  };

  const handleRewind = () =>
    playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10);

  const handleFastForward = () =>
    playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10);

  useEffect(() => {
    if (courseUnit) {
      // condition to ensure the Player has Loaded
      // then update timestamp to the current video course unit timestamp
      if (
        course.coursemoduleinview !== null ||
        course.courseunitlastviewed !== null
      ) {
        // condition to ensure the last viewed course Unit is the unit that get's loaded
        setTimeout(() => {
          if (course.unitprogresstimestamp > 0) {
            // if it is greater than 0, seek
            // playerRef?.current?.seekTo(course.unitprogresstimestamp);
            if (videoJsPlayerRef !== null) {
              videoJsPlayerRef.current.currentTime(
                course?.unitprogresstimestamp
              );
            }
          }
        }, 1000);
      }
    }
    //  eslint-disable-next-line
  }, [courseUnit]);

  useEffect(() => {
    if (schoolname.length > 0) {
      getSchoolLandingPageContents(schoolname, match.params.courseId);
      dispatch(studentAuth());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.params.courseId]);

  useEffect(() => {
    if (school) {
      setDocumentTitle(school);
    }
  }, [school]);

  useEffect(() => {
    // use Effect for listening to keyboard events
    document.addEventListener("keydown", handleKeydownEventListener);

    return () => {
      document.removeEventListener("keydown", handleKeydownEventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoPlayerState]);

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
          <SecondaryPagesNavbar />
          <div className="tutor-course-page__contents">
            <br />
            <Container fluid style={{ width: "92%" }}>
              <Row>
                <Col xs="12" sm="12" md="12" lg="12">
                  <div
                    id="player-container"
                    className="tutor-dashboard-video-player__container"
                  >
                    {courseUnitLoading === true || courseUnit === null ? (
                      <VideoPlayerSkeleton />
                    ) : (
                      <>
                        <Element name="video-player-div"></Element>
                        {nextVideoDelay === true ||
                        nextVideoLoading === true ? (
                          <>
                            <div className="tutor-next-video-details__container">
                              {nextVideoLoading === true ? (
                                <>
                                  <p
                                    style={{
                                      fontSize: "1.1rem",
                                      fontWeight: "600",
                                    }}
                                    className="lead"
                                  >
                                    Loading Next Video{" "}
                                    <span
                                      style={{
                                        fontWeight: "800",
                                        textTransform: "capitalize",
                                      }}
                                    >
                                      "{detailsOfNextVideo?.name}"
                                    </span>
                                    ...
                                  </p>
                                  <div className="player-spinner">
                                    <div className="la-ball-fall la-3x spinner-div">
                                      <div></div>
                                      <div></div>
                                      <div></div>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="tutor-next-video__delay-indicator">
                                    <p className="lead">
                                      Next Video{" "}
                                      <span
                                        style={{
                                          fontWeight: "800",
                                          textTransform: "capitalize",
                                        }}
                                      >
                                        :"{detailsOfNextVideo?.name}"
                                      </span>
                                      ...
                                    </p>
                                    <div className="progress-bar-container">
                                      <CircularProgressbar
                                        value={perentageCount}
                                        styles={{
                                          text: {
                                            fill: "#476EFA",
                                            fontSize: "12px",
                                          },
                                          trail: {
                                            stroke: "#f9fAfd",
                                            height: "40px",
                                          },
                                          path: {
                                            stroke: "#476EFA",
                                          },
                                        }}
                                        maxValue={100}
                                        text={`${Math.round(
                                          perentageCount,
                                          2
                                        )}%`}
                                      />
                                    </div>
                                    <Button
                                      className="btn-cancel__Next-video-loader"
                                      block
                                      onClick={handleCancelNextVideoLoad}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="videojs-container mb-2">
                              {courseUnit.isCloudflareVideoSource !== true ? (
                                <>
                                  <VideoJS
                                    options={videoJsOptions}
                                    onReady={handleVideoJsPlayerReady}
                                  />
                                </>
                              ) : (
                                <>
                                  {courseUnit.isStreamReady === true ? (
                                    <>
                                      <VideoJS
                                        options={videoJsOptions}
                                        onReady={handleVideoJsPlayerReady}
                                      />
                                    </>
                                  ) : (
                                    <>
                                      <div className="video-unit-still-processing__message">
                                        <p className="text-center">
                                          Video is still processing. Refresh
                                          page to update.
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  <div className="tutor-course-info-contents__section">
                    <div className="tutor-student-dashboard-tabs-container">
                      <Nav
                        id="tabs-icons-text"
                        pills
                        role="tablist"
                        className="flex-column flex-md-row"
                      >
                        <NavItem className="tabs-navlink__item">
                          <NavLink
                            aria-selected={tabs === 1}
                            className={`"mb-sm-3 mb-md-0" ${
                              tabs === 1 && "active"
                            }`}
                            onClick={(e) => toggleNavs(e, 1)}
                            href="#pablo"
                            role="tab"
                            style={{
                              borderBottom:
                                tabs === 1 ? `3px solid #000000` : "none",
                            }}
                          >
                            Course Contents
                          </NavLink>
                        </NavItem>
                        <NavItem className="tabs-navlink__item">
                          <NavLink
                            aria-selected={tabs === 2}
                            className={`"mb-sm-3 mb-md-0" ${
                              tabs === 2 && "active"
                            }`}
                            onClick={(e) => toggleNavs(e, 2)}
                            href="#pablo"
                            role="tab"
                            style={{
                              borderBottom:
                                tabs === 2 ? `3px solid #000000` : "none",
                            }}
                          >
                            Notes{" "}
                            {courseUnitNotesCounter > 0 && (
                              <span className="tutor-attachment-counter ml-2">
                                {courseUnitNotesCounter}
                              </span>
                            )}
                          </NavLink>
                        </NavItem>
                        <NavItem className="tabs-navlink__item">
                          <NavLink
                            aria-selected={tabs === 3}
                            className={`"mb-sm-3 mb-md-0" ${
                              tabs === 3 && "active"
                            }`}
                            onClick={(e) => toggleNavs(e, 3)}
                            href="#pablo"
                            role="tab"
                            style={{
                              borderBottom:
                                tabs === 3 ? `3px solid #000000` : "none",
                            }}
                          >
                            Attachments
                            {courseUnit !== null &&
                              courseUnit.attachment.length > 0 && (
                                <>
                                  <span className="tutor-discussions-counter ml-2">
                                    {courseUnit.attachment.length}
                                  </span>
                                </>
                              )}
                          </NavLink>
                        </NavItem>
                        <NavItem className="tabs-navlink__item">
                          <NavLink
                            aria-selected={tabs === 4}
                            className={`"mb-sm-3 mb-md-0" ${
                              tabs === 4 && "active"
                            }`}
                            onClick={(e) => toggleNavs(e, 4)}
                            href="#pablo"
                            role="tab"
                            style={{
                              borderBottom:
                                tabs === 4 ? `3px solid #000000` : "none",
                            }}
                          >
                            Discussions
                            {courseUnit !== null &&
                              courseUnitCommentsCounter > 0 && (
                                <>
                                  <span className="tutor-discussions-counter ml-2">
                                    {courseUnitCommentsCounter}
                                  </span>
                                </>
                              )}
                          </NavLink>
                        </NavItem>
                      </Nav>
                    </div>
                    <div className="tutor-student-dashboard__tabs-content">
                      <Card className="mt-3">
                        <CardBody>
                          <TabContent activeTab={"tabs" + tabs}>
                            <TabPane tabId="tabs1">
                              <div className="tutor-course-modules__container">
                                {courseModulesLoading ? (
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
                                      style={{
                                        fontSize: "32px",
                                        color: "#fff",
                                      }}
                                      className="fas fa-circle-notch fa-spin"
                                    ></i>
                                  </div>
                                ) : (
                                  <>
                                    {courseModules.length === 0 ? (
                                      <p className="text-center">
                                        Course Section Not Found!
                                      </p>
                                    ) : (
                                      <>
                                        {courseModules.map((moduleItem) => (
                                          <TutorModuleItemInPageContent
                                            moduleInView={
                                              course.coursemoduleinview
                                            }
                                            key={moduleItem._id}
                                            moduleItem={moduleItem}
                                            idOfActiveCourseUnit={
                                              courseUnit?._id
                                            }
                                            loadUnit={
                                              loadCourseUnitOnUnitItemClick
                                            }
                                            scrollToVideo={scrollToVideo}
                                            pauseVideoOnCourseUnitChange={
                                              pauseVideoOnCourseUnitChange
                                            }
                                          />
                                        ))}
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            </TabPane>
                            <TabPane tabId="tabs2">
                              {courseUnit !== null && (
                                <TutorNotesContainerInStudentDashboard
                                  courseUnitId={courseUnit._id}
                                  elaspedTime={elaspedTime}
                                  currentTime={currentTime}
                                  videoJsPlayerRef={videoJsPlayerRef}
                                  scrollToVideo={scrollToVideo}
                                  updateCourseUnitNoteCounter={
                                    updateCourseUnitNoteCounter
                                  }
                                />
                              )}
                            </TabPane>
                            <TabPane tabId="tabs3">
                              <div className="tutor-student-attachement__container">
                                <Row>
                                  {courseUnit !== null && (
                                    <>
                                      {courseUnit.attachment.length === 0 ? (
                                        <p
                                          className="text-center"
                                          style={{
                                            color: "#000000",
                                          }}
                                        >
                                          course unit has no attachment
                                        </p>
                                      ) : (
                                        <>
                                          {courseUnit.attachment.map((item) => (
                                            <TutorAttachmentInStudentDashboard
                                              key={item._id}
                                              attachment={item}
                                            />
                                          ))}
                                        </>
                                      )}
                                    </>
                                  )}
                                </Row>
                              </div>
                            </TabPane>
                            <TabPane tabId="tabs4">
                              {courseUnit !== null && (
                                <>
                                  <TutorDiscussionContainerInStudentDashboard
                                    courseUnitId={courseUnit._id}
                                    updateCourseUnitCommentsCounter={
                                      updateCourseUnitCommentsCounter
                                    }
                                    idOfCourseChapter={
                                      courseUnit?.coursechapter
                                    }
                                  />
                                </>
                              )}
                            </TabPane>
                            <TabPane tabId="tabs5">
                              <TutorCourseInfo />
                            </TabPane>
                          </TabContent>
                        </CardBody>
                      </Card>
                    </div>
                  </div>
                </Col>
              </Row>
            </Container>
          </div>
          <div className="tutor-student-dashboard-page-footer">
            Copyright {new Date().getFullYear()} - tutuly.{schoolname}
          </div>
        </>
      )}
    </>
  );
};

export default CourseContentViewPage;
