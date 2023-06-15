import { useState, useEffect } from "react";
import mic from "../../../images/mic-black.svg";
import vid from "../../../images/vid-black.svg";

export default function ToggleAudio() {
  const [audioInputDevices, setAudioInputDevices] = useState([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState([]);
  const [selectedInputDevice, setSelectedInputDevice] = useState("");
  const [selectedOutputDevice, setSelectedOutputDevice] = useState("");

  useEffect(() => {
    // Get available audio input and output devices
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const inputDevices = devices.filter(
        (device) => device.kind === "audioinput"
      );
      const outputDevices = devices.filter(
        (device) => device.kind === "audiooutput"
      );
      setAudioInputDevices(inputDevices);
      setAudioOutputDevices(outputDevices);
      setSelectedInputDevice(inputDevices[0]?.deviceId);
      setSelectedOutputDevice(outputDevices[0]?.deviceId);
    });
  }, []);

  function handleInputDeviceChange(event) {
    setSelectedInputDevice(event.target.value);
  }

  function handleOutputDeviceChange(event) {
    setSelectedOutputDevice(event.target.value);
  }

  //   function toggleAudioDevices() {
  //     // Get the current audio stream
  //     navigator.mediaDevices
  //       .getUserMedia({ audio: true })
  //       .then((stream) => {
  //         // Get the audio tracks
  //         const audioTracks = stream.getAudioTracks();
  //         // Get the current input and output devices
  //         const currentInputDevice = audioTracks[0].getSettings().deviceId;
  //         const currentOutputDevice = stream
  //           .getAudioTracks()[0]
  //           .getSettings().deviceId;
  //         // Choose the next input and output devices
  //         const nextInputDevice =
  //           audioInputDevices.find(
  //             (device) => device.deviceId !== currentInputDevice
  //           )?.deviceId || audioInputDevices[0]?.deviceId;
  //         const nextOutputDevice =
  //           audioOutputDevices.find(
  //             (device) => device.deviceId !== currentOutputDevice
  //           )?.deviceId || audioOutputDevices[0]?.deviceId;
  //         // Create a new media stream with the next input and output devices
  //         navigator.mediaDevices
  //           .getUserMedia({
  //             audio: {
  //               deviceId: { exact: nextInputDevice },
  //             },
  //             output: {
  //               deviceId: { exact: nextOutputDevice },
  //             },
  //           })
  //           .then((newStream) => {
  //             // Stop the old stream and replace it with the new stream
  //             stream.getTracks().forEach((track) => track.stop());
  //             newStream
  //               .getAudioTracks()
  //               .forEach((track) => stream.addTrack(track));
  //           })
  //           .catch((error) => console.error(error));
  //       })
  //       .catch((error) => console.error(error));
  //   }

  return (
    <div className="toggle-audio">
      {/* <label htmlFor="input-devices">Input device:</label>
       */}
      <div className="microphone">
        <img src={mic} alt="microphone" className="microphone" />
        <select
          id="input-devices"
          value={selectedInputDevice}
          onChange={handleInputDeviceChange}
        >
          {audioInputDevices.map((device, index) => (
            <option
              key={device.deviceId}
              value={device.deviceId}
              style={{ display: index === 0 ? "none" : "" }}
            >
              {device.label}
            </option>
          ))}
        </select>
      </div>
      <div className="microphone">
        <img src={vid} alt="video" />

        <select
          id="output-devices"
          value={selectedOutputDevice}
          onChange={handleOutputDeviceChange}
        >
          {audioOutputDevices.map((device, index) => (
            <option
              key={device.deviceId}
              value={device.deviceId}
              style={{ display: index === 0 ? "none" : "" }}
            >
              {device.label}
            </option>
          ))}
        </select>
      </div>
      {/* <button onClick={toggleAudioDevices}>Toggle Audio Devices</button> */}
    </div>
  );
}
