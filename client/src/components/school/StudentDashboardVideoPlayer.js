import React, { useState, useRef } from "react";
import ReactPlayer from "react-player";
import { Container, ListGroup, ListGroupItem } from "reactstrap";
import StudentDashboardVideoPlayerControls from "./StudentDashboardVideoPlayerControls";
import screenfull from "screenfull";

import "../../custom-styles/pages/studentvideoplayerstyle.css";

const format = (seconds) => {
  if (isNaN(seconds)) {
    return "00:00";
  }

  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, "0");

  if (hh) {
    return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
  }

  return `${mm}:${ss}`;
};

let count = 0;

const VideoPlayer = ({ courseunit }) => {
  const [videoPlayerState, setVideoPlayerState] = useState({
    playing: false,
    muted: false,
    volume: 0.5,
    playbackRate: 1.0,
    played: 0,
    seeking: false,
  });

  const [timeDisplayFormat, setTimeDisplayFormat] = useState("normal");
  const { playing, muted, volume, playbackRate, played } = videoPlayerState;
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsRef = useRef(null);

  const [bookmarks, setBookMark] = useState([]);

  const canvasRef = useRef(null);

  const handlePlayPause = () => {
    setVideoPlayerState({
      ...videoPlayerState,
      playing: !videoPlayerState.playing,
    });
  };

  const handleMute = () => {
    setVideoPlayerState({
      ...videoPlayerState,
      muted: !videoPlayerState.muted,
    });
  };

  const handleVolumeChange = (value) => {
    setVideoPlayerState({
      ...videoPlayerState,
      volume: parseFloat(value / 100),
      muted: value === 0 ? true : false,
    });
  };

  const onVolumeSeekUp = (value) => {
    setVideoPlayerState({
      ...videoPlayerState,
      volume: parseFloat(value / 100),
      muted: value === 0 ? true : false,
    });
  };

  const handlePlaybackRateChange = (rate) => {
    setVideoPlayerState({
      ...videoPlayerState,
      playbackRate: rate,
    });
  };

  const addBookMark = () => {
    const canvas = canvasRef.current;
    canvas.width = 160;
    canvas.height = 90;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      playerRef.current.getInternalPlayer(),
      0,
      0,
      canvas.width,
      canvas.height
    );

    const imageUrl = canvas.toDataURL();
    canvas.width = 0;
    canvas.height = 0;

    setBookMark([
      ...bookmarks,
      {
        time: currentTime,
        display: elaspedTime,
        image: imageUrl,
      },
    ]);
    console.log(currentTime, "currentime");
    console.log(elaspedTime, "elasped time");
  };

  const handleProgress = (changeState) => {
    if (count > 2) {
      controlsRef.current.style.visibility = "hidden";
      count = 0;
    }

    //  eslint-disable-next-line
    if (controlsRef.current.style.visibility == "visible") {
      count++;
    }

    if (!videoPlayerState.seeking) {
      setVideoPlayerState({
        ...videoPlayerState,
        ...changeState,
      });
    }
    console.log(changeState);
  };

  const toggleFullScreen = () => screenfull.toggle(playerContainerRef.current);

  const handleRewind = () =>
    playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10);

  const handleFastForward = () =>
    playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10);

  const handleSeekChange = (value) => {
    setVideoPlayerState({
      ...videoPlayerState,
      played: parseFloat(value / 100),
    });
  };

  const handleSeekMouseDown = (value) => {
    setVideoPlayerState({
      ...videoPlayerState,
      seeking: false,
    });
    playerRef.current.seekTo(value / 100);
  };

  const handleSeekMouseUp = () => {
    setVideoPlayerState({
      ...videoPlayerState,
      seeking: true,
    });
  };

  const handleMouseMove = () => {
    controlsRef.current.style.visibility = "visible";
    count = 0;
  };

  const currentTime = playerRef.current
    ? playerRef.current.getCurrentTime()
    : "00:00";
  const duration = playerRef.current
    ? playerRef.current.getDuration()
    : "00:00";

  const elaspedTime =
    timeDisplayFormat === "normal"
      ? format(currentTime)
      : `-${format(duration - currentTime)}`;
  const totalDuration = format(duration);

  const handleChangeDisplayFormat = () => {
    setTimeDisplayFormat(
      timeDisplayFormat === "normal" ? "remaining" : "normal"
    );
  };

  return (
    <>
      <Container>
        <div
          ref={playerContainerRef}
          className="video-player mb-3"
          onMouseMove={handleMouseMove}
        >
          <ReactPlayer
            ref={playerRef}
            width={"100%"}
            height={"100%"}
            url={courseunit.videourl}
            muted={muted}
            playing={playing}
            volume={volume}
            playbackRate={playbackRate}
            onProgress={handleProgress}
            onDuration={(duration) => console.log(duration)}
            // onProgress={(data) => console.log(data)}
            config={{
              file: {
                attributes: {
                  crossorigin: "anonymous",
                },
              },
            }}
          ></ReactPlayer>
          <StudentDashboardVideoPlayerControls
            ref={controlsRef}
            courseunit={courseunit}
            playing={playing}
            onPlayPause={handlePlayPause}
            onRewind={handleRewind}
            onFastForward={handleFastForward}
            muted={muted}
            onMute={handleMute}
            onVolumeChange={handleVolumeChange}
            onVolumeSeekUp={onVolumeSeekUp}
            volume={volume}
            playbackRate={playbackRate}
            onPlaybackRateChange={handlePlaybackRateChange}
            onToggleFullScreen={toggleFullScreen}
            played={played}
            onSeek={handleSeekChange}
            onSeekMouseDown={handleSeekMouseDown}
            onSeekMouseUp={handleSeekMouseUp}
            elaspedTime={elaspedTime}
            totalDuration={totalDuration}
            onChangeDisplayFormat={handleChangeDisplayFormat}
            onBookmark={addBookMark}
          />
        </div>
        <ListGroup className="mt-4">
          {bookmarks.map((bookmark, index) => {
            return (
              <ListGroupItem
                onClick={() => playerRef.current.seekTo(bookmark.time)}
                key={index}
              >
                <img crossOrigin="anonymous" alt="..." src={bookmark.image} />
                <h3>Bookmark at {bookmark.display}</h3>
              </ListGroupItem>
            );
          })}
        </ListGroup>
        <canvas ref={canvasRef} />
      </Container>
    </>
  );
};

export default VideoPlayer;
