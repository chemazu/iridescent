import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { useStore } from "react-redux";
import { useDispatch } from "react-redux";
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
import { CircularProgressbar } from "react-circular-progressbar";
import { Element, scroller } from "react-scroll";
import PageNavbar from "./PageNavbar";
import StudentDashboardModuleItem from "./StudentDashboardModuleItem";
import StudentAttachmentItem from "./StudentAttachmentItem";
import NotesContainer from "./NotesContainer";
import DiscussionsContainer from "./DiscussionsContainer";
import CourseMoreInfo from "./CourseMoreInfo";
import setAuthToken from "../../utilities/setAuthToken";
import format from "../../utilities/format";
import setDocumentTitle from "../../utilities/setDocumentTitle";
import { studentAuth } from "../../actions/student";
import { useAlert } from "react-alert";
import VideoJS from "../VideoJSPlayer/VideoJS";

import "../../custom-styles/pages/studentsinglecoursepage.css";
import "../../custom-styles/schoollandingpagecomponents/pacmananimationstyles.css";
import "react-circular-progressbar/dist/styles.css";
import VideoPlayerSkeleton from "./VideoPlayerSkeleton";

const StudentSingleCoursePage = ({ match }) => {
  const [school, setSchool] = useState(null);
  const [theme, setTheme] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const dispatch = useDispatch();

  const videoJsPlayerRef = useRef(null);

  const store = useStore();
  const state = store.getState();
  const schoolname = state.subdomain;

  const alert = useAlert();

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

  const [interValId, setInterValId] = useState(null);

  let videoDelayCountInterVal; // variable used to hold interval loader for next video

  // video player state
  const [videoPlayerState, setVideoPlayerState] = useState({
    playing: false,
    muted: false,
    volume: 0.5,
    playbackRate: 1.0,
    played: 0,
    seeking: false,
  });

  const [timeDisplayFormat] = useState("normal");
  const { playing, volume } = videoPlayerState;
  const playerRef = useRef(null);

  // const currentTime = playerRef.current
  //   ? playerRef.current.getCurrentTime()
  //   : "00:00"; // the actual time in seconds that the player has played

  const duration = courseUnit !== null ? courseUnit.duration : "00:00"; // the total time of the video

  const elaspedTime =
    timeDisplayFormat === "normal"
      ? format(currentTime)
      : `-${format(duration - currentTime)}`; // human readable format for the current time

  const [tabs, setTabs] = useState(1);
  const toggleNavs = (e, index) => {
    e.preventDefault();
    setTabs(index);
  };

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

  const getSchoolLandingPageContents = async (schoolName, courseId) => {
    setPageLoading(true);
    const school = await getSchoolBySchoolName(schoolName);
    if (school) {
      await getSchoolThemeBySchoolId(school._id);
      await getAllPageCourseAndModules(schoolName, courseId);
    }
    setPageLoading(false);
  };
  // page contents controls ends here

  const scrollToVideo = () => {
    scroller.scrollTo("video-player-div", {
      duration: 800,
      delay: 7,
      smooth: true,
      offset: -40,
    });
  };

  const updateCourseUnitNoteCounter = (count) => {
    setCourseUnitNotesCounter(count);
  };

  const updateCourseUnitCommentsCounter = (count) => {
    setCourseUnitCommentCounter(count);
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

  useEffect(() => {
    if (schoolname.length > 0) {
      getSchoolLandingPageContents(schoolname, match.params.courseId);
      dispatch(studentAuth());
    }
    // eslint-disable-next-line
  }, [match.params.courseId]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolname]);

  useEffect(() => {
    if (school) {
      setDocumentTitle(school);
    }
  }, [school]);

  // const handlePlayPauseKeyBoardEvents = (e) => {
  //   const commentsTextbox = document.querySelector("#comment-textarea-id");
  //   const replyTextbox = document.querySelector("#reply-textarea-id");
  //   const notesTextBox = document.querySelector("#notes-textarea-id");

  //   if (
  //     commentsTextbox === document.activeElement ||
  //     replyTextbox === document.activeElement ||
  //     notesTextBox === document.activeElement
  //   ) {
  //     // nothing really happens if these elements are the active elements
  //     // we only don't want the preventDefault() function and handlePlayPause()
  //     // function to run
  //   } else {
  //     e.preventDefault();
  //     handlePlayPause();
  //   }
  // };

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

  useEffect(() => {
    // use Effect for listening to keyboard events
    document.addEventListener("keydown", handleKeydownEventListener);

    return () => {
      document.removeEventListener("keydown", handleKeydownEventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoPlayerState]);

  const pauseVideoOnCourseUnitChange = () => {
    if (playing === true) {
      setVideoPlayerState({
        ...videoPlayerState,
        playing: false,
      });
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

  // end of player controllers

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
          {!pageLoading && school === null && theme === null ? (
            <p className="text-center lead">School Not Found</p>
          ) : (
            <>
              <PageNavbar theme={theme} pageName={schoolname} />
              <div
                style={{
                  backgroundColor:
                    theme.themestyles.secondarypagebackgroundcolor,
                }}
                className="student-course-page__contents"
              >
                <br />
                <Container
                  fluid
                  style={{
                    width: "92%",
                  }}
                >
                  <Row>
                    <Col xs="12" sm="12" md="12" lg="12">
                      <div
                        id="player-container"
                        className="student-dashboard__player-container"
                      >
                        {courseUnitLoading === true || courseUnit === null ? (
                          <VideoPlayerSkeleton />
                        ) : (
                          <>
                            <Element name="video-player-div"></Element>
                            {nextVideoDelay === true ||
                            nextVideoLoading === true ? (
                              <>
                                <div
                                  style={{
                                    width: "100%",
                                    height: "70vh",
                                    backgroundColor:
                                      theme.themestyles
                                        .coursecardbackgroundcolor,
                                    color:
                                      theme.themestyles.coursecardtextcolor,
                                    padding: "5vh 10vh",
                                  }}
                                  className="next-video-details__container"
                                >
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
                                        <div
                                          style={{
                                            color:
                                              theme.themestyles
                                                .coursecardtextcolor,
                                            backgroundColor:
                                              theme.themestyles
                                                .coursecardbackgroundcolor,
                                          }}
                                          className="la-ball-fall la-3x"
                                        >
                                          <div></div>
                                          <div></div>
                                          <div></div>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div
                                        style={{
                                          color:
                                            theme.themestyles
                                              .coursecardtextcolor,
                                          backgroundColor:
                                            theme.themestyles
                                              .coursecardbackgroundcolor,
                                        }}
                                        className="next-video__delay-indicator"
                                      >
                                        <p
                                          style={{
                                            fontSize: "1.1rem",
                                            fontWeight: "600",
                                          }}
                                          className="lead"
                                        >
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
                                        <div
                                          style={{
                                            width: "95px",
                                            height: "95px",
                                            margin: "4px auto",
                                            backgroundColor:
                                              theme.themestyles
                                                .coursecardbackgroundcolor,
                                          }}
                                        >
                                          <CircularProgressbar
                                            value={perentageCount}
                                            styles={{
                                              text: {
                                                fill: theme.themestyles
                                                  .coursecardtextcolor,
                                                fontSize: "12px",
                                              },
                                              trail: {
                                                stroke:
                                                  theme.themestyles
                                                    .coursecardtextcolor,
                                              },
                                              path: {
                                                stroke:
                                                  theme.themestyles
                                                    .coursecardbackgroundcolor,
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
                                          block
                                          onClick={handleCancelNextVideoLoad}
                                          style={{
                                            backgroundColor: "transparent",
                                            color:
                                              theme.themestyles
                                                .coursecardtextcolor,
                                            margin: "20px auto",
                                            border: `1px solid ${theme.themestyles.coursecardtextcolor}`,
                                            boxShadow: "none",
                                          }}
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
                                  {courseUnit.isCloudflareVideoSource !==
                                  true ? (
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
                      <div className="couse-info-and-contents__section">
                        <div
                          style={{
                            borderBottom: `1.5px solid ${theme.themestyles.primarytextcolor}`,
                          }}
                          className="student_dashborad-tabs-container"
                        >
                          <Nav
                            className="flex-column flex-md-row"
                            id="tabs-icons-text"
                            pills
                            role="tablist"
                          >
                            <NavItem>
                              <NavLink
                                aria-selected={tabs === 1}
                                className={`"mb-sm-3 mb-md-0" ${
                                  tabs === 1 && "active"
                                }`}
                                onClick={(e) => toggleNavs(e, 1)}
                                href="#pablo"
                                role="tab"
                                style={{
                                  color: theme.themestyles.primarytextcolor,
                                  backgroundColor:
                                    theme.themestyles
                                      .secondarypagebackgroundcolor,
                                  borderBottom:
                                    tabs === 1
                                      ? `3px solid ${theme.themestyles.primarytextcolor}`
                                      : "none",
                                }}
                              >
                                Course Contents
                              </NavLink>
                            </NavItem>
                            <NavItem>
                              <NavLink
                                aria-selected={tabs === 2}
                                className={`"mb-sm-3 mb-md-0" ${
                                  tabs === 2 && "active"
                                }`}
                                onClick={(e) => toggleNavs(e, 2)}
                                href="#pablo"
                                role="tab"
                                style={{
                                  color: theme.themestyles.primarytextcolor,
                                  backgroundColor:
                                    theme.themestyles
                                      .secondarypagebackgroundcolor,
                                  borderBottom:
                                    tabs === 2
                                      ? `3px solid ${theme.themestyles.primarytextcolor}`
                                      : "none",
                                }}
                              >
                                Notes{" "}
                                {courseUnitNotesCounter > 0 && (
                                  <>
                                    <span
                                      style={{
                                        color:
                                          theme.themestyles
                                            .primarybackgroundcolor,
                                        backgroundColor:
                                          theme.themestyles.primarytextcolor,
                                      }}
                                      className="attachment-counter ml-2"
                                    >
                                      {courseUnitNotesCounter}
                                    </span>
                                  </>
                                )}
                              </NavLink>
                            </NavItem>
                            <NavItem>
                              <NavLink
                                aria-selected={tabs === 3}
                                className={`"mb-sm-3 mb-md-0" ${
                                  tabs === 3 && "active"
                                }`}
                                onClick={(e) => toggleNavs(e, 3)}
                                href="#pablo"
                                role="tab"
                                style={{
                                  color: theme.themestyles.primarytextcolor,
                                  backgroundColor:
                                    theme.themestyles
                                      .secondarypagebackgroundcolor,
                                  borderBottom:
                                    tabs === 3
                                      ? `3px solid ${theme.themestyles.primarytextcolor}`
                                      : "none",
                                }}
                              >
                                Attachments
                                {courseUnit !== null &&
                                  courseUnit.attachment.length > 0 && (
                                    <>
                                      <span
                                        style={{
                                          color:
                                            theme.themestyles
                                              .primarybackgroundcolor,
                                          backgroundColor:
                                            theme.themestyles.primarytextcolor,
                                        }}
                                        className="attachment-counter ml-2"
                                      >
                                        {courseUnit.attachment.length}
                                      </span>
                                    </>
                                  )}
                              </NavLink>
                            </NavItem>
                            <NavItem>
                              <NavLink
                                aria-selected={tabs === 4}
                                className={`"mb-sm-3 mb-md-0" ${
                                  tabs === 4 && "active"
                                }`}
                                onClick={(e) => toggleNavs(e, 4)}
                                href="#pablo"
                                role="tab"
                                style={{
                                  color: theme.themestyles.primarytextcolor,
                                  backgroundColor:
                                    theme.themestyles
                                      .secondarypagebackgroundcolor,
                                  borderBottom:
                                    tabs === 4
                                      ? `3px solid ${theme.themestyles.primarytextcolor}`
                                      : "none",
                                }}
                              >
                                Discussions
                                {courseUnit !== null &&
                                  courseUnitCommentsCounter > 0 && (
                                    <>
                                      <span
                                        style={{
                                          color:
                                            theme.themestyles
                                              .primarybackgroundcolor,
                                          backgroundColor:
                                            theme.themestyles.primarytextcolor,
                                        }}
                                        className="discussions-counter ml-2"
                                      >
                                        {courseUnitCommentsCounter}
                                      </span>
                                    </>
                                  )}
                              </NavLink>
                            </NavItem>
                          </Nav>
                        </div>
                        <div className="student-dashboard__tabs-content">
                          <Card
                            style={{
                              backgroundColor:
                                theme.themestyles.secondarypagebackgroundcolor,
                            }}
                            className="mt-3"
                          >
                            <CardBody>
                              <TabContent activeTab={"tabs" + tabs}>
                                <TabPane tabId="tabs1">
                                  <div className="course-modules__container">
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
                                              <StudentDashboardModuleItem
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
                                                theme={theme}
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
                                    <>
                                      <NotesContainer
                                        courseUnitId={courseUnit._id}
                                        elaspedTime={elaspedTime}
                                        currentTime={currentTime}
                                        videoJsPlayerRef={videoJsPlayerRef}
                                        scrollToVideo={scrollToVideo}
                                        updateCourseUnitNoteCounter={
                                          updateCourseUnitNoteCounter
                                        }
                                        theme={theme}
                                      />
                                    </>
                                  )}
                                </TabPane>
                                <TabPane tabId="tabs3">
                                  <div className="student-attachment__container">
                                    <Row>
                                      {courseUnit !== null && (
                                        <>
                                          {courseUnit.attachment.length ===
                                          0 ? (
                                            <p
                                              className="text-center"
                                              style={{
                                                color:
                                                  theme.themestyles
                                                    .primarytextcolor,
                                              }}
                                            >
                                              course unit has no attachment
                                            </p>
                                          ) : (
                                            <>
                                              {courseUnit.attachment.map(
                                                (item) => (
                                                  <StudentAttachmentItem
                                                    key={item._id}
                                                    attachment={item}
                                                    theme={theme}
                                                  />
                                                )
                                              )}
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
                                      <DiscussionsContainer
                                        courseUnitId={courseUnit._id}
                                        updateCourseUnitCommentsCounter={
                                          updateCourseUnitCommentsCounter
                                        }
                                        theme={theme}
                                        idOfCourseChapter={
                                          courseUnit?.coursechapter
                                        }
                                      />
                                    </>
                                  )}
                                </TabPane>
                                <TabPane tabId="tabs5">
                                  <CourseMoreInfo theme={theme} />
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
              <div
                style={{
                  color: theme.themestyles.footertextcolor,
                  backgroundColor: theme.themestyles.footerbackgroundcolor,
                }}
                className="studentdashboard-page-footer"
              >
                Copyright {new Date().getFullYear()} - {schoolname}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default StudentSingleCoursePage;
