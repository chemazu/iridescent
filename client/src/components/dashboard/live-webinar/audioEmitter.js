import join from "./audio/join.wav";
import leave from "./audio/leave.wav";

export default function classroomAudio(action, volume = 0.5) {
  console.log(action);

  // Create an audio element
  const audio = new Audio();

  // Define audio sources based on actions
  const audioSources = {
    "joins room": join,
    "leaves room": leave,
    // Add more actions and corresponding audio sources as needed
  };

  // Check if the action has a corresponding audio source
}
