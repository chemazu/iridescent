import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "./videojs-custom-styles.css";
import "videojs-seek-buttons";
import "videojs-seek-buttons/dist/videojs-seek-buttons.css";
import "videojs-overlay";
import "videojs-contrib-quality-levels";
import "videojs-hls-quality-selector";

const VideoJS = ({ options, onReady }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");

      videoElement.classList.add("vjs-big-play-centered");
      videoElement.classList.add("vjs-16-9");
      videoElement.classList.add("vjs-fill");
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        videojs.log("player is ready");
        onReady && onReady(player);
      }));

      player.hlsQualitySelector({
        displayCurrentQuality: true,
      });
      player.overlay({
        overlays: [
          {
            align: "top-left",
            class: "customOverlay",
            content: `<p>${options.videotitle}</p>`,
            start: "pause",
            end: "play",
          },
          {
            align: "top-left",
            class: "customOverlay",
            content: `<p>${options.videotitle}</p>`,
            start: "play",
            end: 4,
          },
        ],
      });
    } else {
      const player = playerRef.current;

      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, videoRef]);

  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <>
      <div data-vjs-player>
        <div ref={videoRef} />
      </div>
    </>
  );
};

export default VideoJS;
