import { Server } from "socket.io";
import http from "http";
import LiveWebinar from "./models/Livewebinar";

const setupSocketIO = (app) => {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });
  const timers = {};
  const timerControl = {};
  const roomStatus = {};
  const broadcasterHolder = {};
  const freeTimers = {};
  let pollQuizHolder = {};
  let broadcasterScreen = {};
  let audioStatus = {};
  const roomsHolder = {};
  const userHeartbeats = {}; // Initialize an object to track heartbeats
  const userRooms = {}; // Initialize an object to track which room each user is in
  const heartbeatTimeout = 10000;
  const waitingRoom = {};

  io.on("connection", (socket) => {
    // broadcaster
    socket.on("broadcaster", async (roomId, peerId, audioStat) => {
      broadcasterHolder[roomId] = { peerId, socketId: socket.id };
      audioStatus[roomId] = audioStat;
      socket.join(roomId);
      socket.broadcast
        .to(roomId)
        .emit("broadcaster", broadcasterHolder[roomId].peerId);
      if (waitingRoom[roomId]) {
        io.in(roomId).emit("update-attendance", waitingRoom[roomId]);
      }
      let currentWebinar = await LiveWebinar.findOne({ streamKey: roomId });
      currentWebinar.isLive = true;
      await currentWebinar.save();
    });

    socket.on("watcher-exit", (roomId, attendanceId) => {
      // Check if the room exists in roomsHolder
      if (roomsHolder[roomId]) {
        // Remove the attendanceId from the set
        roomsHolder[roomId].delete(attendanceId);

        // Count the number of people in the room after the user exits
        const numberOfPeopleInRoom = roomsHolder[roomId].size;
      }

      io.in(roomId).emit("watcher-exit", socket.id);

      if (broadcasterHolder[roomId].studentStream) {
        const students = broadcasterHolder[roomId]?.studentStream;
        const studentIndex = students.findIndex(
          (student) => student.socketId === socketId
        );

        if (studentIndex !== -1) {
          // Remove the student from the array
          const removedStudent = students.splice(studentIndex, 1)[0];

          // Emit the event that the speaking student has left
          io.in(roomId).emit(
            "speaking student has left",
            removedStudent.socketId
          );
        }
      }
    });

    socket.on(
      "watcher",
      async (
        roomId,
        peerId,
        attendanceId,
        userName,
        watcherAvatar,
        registeredUser,
        studentIp
      ) => {
        // get the id from webinar
        // get the list of blocked student
        // once a person enters  check if the user is blocked via the attendanceId
        // find a way to get the id from localstorage

        socket.join(roomId);
        let numberOfPeopleInRoom;
        if (!roomsHolder[roomId]) {
          roomsHolder[roomId] = new Set();
        }
        if (!roomsHolder[roomId].has(attendanceId)) {
          // If it's not in the set, add it
          roomsHolder[roomId].add(attendanceId);

          // Count the number of people in the room
          numberOfPeopleInRoom = roomsHolder[roomId].size;
          io.in(roomId).emit("updateAttendance", numberOfPeopleInRoom);
        }
        const room = io.sockets.adapter.rooms.get(roomId);
        let roomSize = room ? room.size : 1;
        // check screensharing

        if (broadcasterHolder[roomId]) {
          if (broadcasterScreen[roomId]) {
            io.to(socket.id).emit(
              "join screen stream",
              broadcasterScreen[roomId].peerId
            );
          }
          if (audioStatus[roomId]) {
            io.to(socket.id).emit("audio status", audioStatus[roomId]);
          }

          io.to(socket.id).emit(
            "join stream",
            numberOfPeopleInRoom,
            broadcasterHolder[roomId].peerId,
            audioStatus[roomId]
          );
          if (broadcasterHolder[roomId].studentStream) {
            io.to(socket.id).emit(
              "welcome student speaking",
              // update this
              broadcasterHolder[roomId].studentStream
            );
          }

          io.in(roomId).emit(
            "watcher",
            socket.id,
            peerId,
            userName,
            watcherAvatar,
            attendanceId,
            registeredUser,
            studentIp
          );
          let roomTimer = null;
          if (freeTimers[roomId]) {
            roomTimer = freeTimers[roomId];
          }
          io.to(socket.id).emit(
            "currentStatus",
            roomSize,
            roomTimer,
            pollQuizHolder[roomId]
          );
        } else {
          // Hold the students in the waiting room

          if (waitingRoom[roomId]) {
            // Check uniqueness based on studentIp
            const existingStudent = waitingRoom[roomId].find(
              (student) => student.studentIp === studentIp
            );

            if (existingStudent) {
              // Student with the same studentIp already exists, handle accordingly
              console.log("Student with the same IP already exists.");
              // You might want to emit an error or take some other action
            } else {
              // Do stuff
              let newWaitingRoom = [
                ...waitingRoom[roomId],
                {
                  socketId: socket.id,
                  peerId,
                  userName,
                  watcherAvatar,
                  studentId: attendanceId,
                  registeredUser,
                  studentIp,
                  speakingStatus: false,
                  menuActive: false,
                  tutorMuted: false,
                },
              ];
              console.log(newWaitingRoom);
              waitingRoom[roomId] = newWaitingRoom; // Update waitingRoom with the new array
              console.log(waitingRoom[roomId]);
            }
          } else {
            // If the waiting room doesn't exist, create it
            waitingRoom[roomId] = [];
          }

          io.to(socket.id).emit("no stream");
        }
      }
    );
    socket.on("update-attendance", (roomId, attendanceList) => {
      console.log(attendanceList);

      io.in(roomId).emit("update-attendance", attendanceList);
    });
    // Handle heartbeat events
    socket.on("heartbeat", (userId, roomId) => {
      // Update the last received heartbeat for the user
      userHeartbeats[userId] = Date.now();

      // Track which room the user is in
      userRooms[userId] = roomId;

      // You can also update the room status here if needed
      // roomStatus[roomId] = updatedStatus; // Update room status as needed
    });

    // ...

    // Periodically check for inactive users and remove them
    const heartbeatCheckInterval = setInterval(() => {
      const currentTime = Date.now();
      for (const userId in userHeartbeats) {
        if (userHeartbeats.hasOwnProperty(userId)) {
          const lastHeartbeatTime = userHeartbeats[userId];
          if (currentTime - lastHeartbeatTime > heartbeatTimeout) {
            // User's heartbeat hasn't been received within the timeout
            const roomId = userRooms[userId]; // Get the room the user is in

            if (roomId) {
              // Remove the user from the room
              if (roomsHolder[roomId]) {
                roomsHolder[roomId].delete(userId);
                console.log("delete the heart beat");
              }

              // Update the room status as needed
              // roomStatus[roomId] = updatedStatus; // Update room status as needed

              // Notify other users in the room about the updated attendance
              const numberOfPeopleInRoom = roomsHolder[roomId]?.size;
              io.in(roomId).emit("updateAttendance", numberOfPeopleInRoom);

              // Remove the user's heartbeat and room information
              delete userHeartbeats[userId];
              delete userRooms[userId];
            }
          }
        }
      }
    }, heartbeatTimeout);
    socket.on("startScreenSharing", (roomId, peerId) => {
      broadcasterScreen[roomId] = { peerId, socketId: socket.id };
      io.in(roomId).emit("startScreenSharing", peerId);
    });

    socket.on("speaking_status", (roomId, status) => {
      if (broadcasterHolder[roomId]?.studentStream) {
        const student = broadcasterHolder[roomId]?.studentStream.find(
          (student) => student.socketId === socket.id
        );
        if (student) {
          socket.broadcast
            .to(roomId)
            .emit("speaking_status", status, socket.id, student);
        } else {
        }
      }
      // let streamingStudent =
      //   broadcasterHolder[roomId]?.studentStream?.audioStat || 0;

      // socket.broadcast
      //   .to(roomId)
      //   .emit("speaking_status", status, socket.id, streamingStudent);
    });

    socket.on("stopScreenSharing", (roomId) => {
      io.in(roomId).emit("stopScreenSharing");

      delete broadcasterScreen[roomId];
    });

    socket.on("audiovisuals", (roomId, updated, type) => {
      io.in(roomId).emit("audiovisuals", updated);

      audioStatus[roomId] = updated;
    });
    socket.on("message", (message, roomId) => {
      socket.broadcast.to(roomId).emit("message", { ...message });
      if (message.type === "quiz" || message.type === "poll") {
        if (!pollQuizHolder[roomId]) {
          pollQuizHolder[roomId] = [];
        }
        pollQuizHolder[roomId].push(message);
      }
    });
    socket.on("specialchat", (message, roomId) => {
      socket.broadcast.to(roomId).emit("specialchat", { ...message });

      if (!pollQuizHolder[roomId]) {
        pollQuizHolder[roomId] = [];
      }
      pollQuizHolder[roomId].push(message);
    });
    socket.on("special close", (roomid, index) => {
      delete pollQuizHolder[roomid];
      clearInterval(timerControl[roomid]);
      delete timerControl[roomid];
      delete timers[roomid];

      socket.broadcast.to(roomid).emit("special close", index);
    });
    socket.on("special submit", (type, result, roomId, user) => {
      socket.broadcast.to(roomId).emit("special submit", type, result, user);
    });
    socket.on("startTimer", (timerData) => {
      const { duration, roomid } = timerData;

      // Check if a timer is already running for the same room and question
      if (timers[roomid]) {
        socket.emit(
          "timerError",
          "A timer is already running for this question."
        );
        return;
      }

      // Create a new timer for the room and question
      timers[roomid] = {
        duration: duration,
        remainingTime: duration,
      };

      // Broadcast the start event to all connected clients in the room
      io.in(roomid).emit("timerStarted", duration);

      // Start the countdown
      const timer = setInterval(() => {
        if (timers[roomid]) {
          timers[roomid].remainingTime -= 1;
          io.in(roomid).emit("timerTick", timers[roomid].remainingTime, timers);
          if (timers[roomid].remainingTime <= 0) {
            clearInterval(timer);
            pollQuizHolder[roomid] = [];
            io.in(roomid).emit("timerEnded");

            // Clean up the timer after it ends
            delete timers[roomid];
          }
        }

        // Broadcast the remaining time to all connected clients in the room
      }, 1000);
    });

    socket.on("updatedPollResult", (roomid, updatedResults) => {
      io.in(roomid).emit("updatedPollResult", updatedResults);
    });

    // student audio request algorithm

    socket.on("request audio", (roomId) => {
      const currentSocketId = socket.id;
      socket
        .to(broadcasterHolder[roomId].socketId)
        .emit("request audio", currentSocketId);
    });

    socket.on("grant student access", (roomid, studentSocketId) => {
      socket.to(studentSocketId).emit("start streaming");
    });

    // socket.on("student stream", (roomId, peerId, audioStat) => {
    //   // to handle multiple student make this an array
    //   if (broadcasterHolder[roomId]) {
    //     broadcasterHolder[roomId].studentStream = {
    //       peerId,
    //       audioStat,
    //       socketId: socket.id,
    //     };
    //   }

    //   socket.broadcast.to(roomId).emit("student stream", peerId, audioStat);
    // });
    socket.on("student stream", (roomId, peerId, audioStat) => {
      // Initialize studentStream as an array if it doesn't exist
      if (
        broadcasterHolder[roomId] &&
        !broadcasterHolder[roomId].studentStream
      ) {
        broadcasterHolder[roomId].studentStream = [];
      }

      // Check if the request is not a duplicate
      const isUniqueRequest = !broadcasterHolder[roomId].studentStream.some(
        (stream) => stream.peerId === peerId
      );

      if (isUniqueRequest) {
        // Add the new student stream object to the array
        broadcasterHolder[roomId].studentStream.push({
          peerId,
          audioStat,
          socketId: socket.id,
        });

        // Broadcast the unique student stream to others in the room
        socket.broadcast
          .to(roomId)
          .emit("student stream", peerId, audioStat, socket.id);
      } else {
        // Handle duplicate request (if needed)
      }
    });
    socket.on("on student audio", (roomId) => {
      // Check if studentStream exists and is an array
      if (
        broadcasterHolder[roomId].studentStream &&
        Array.isArray(broadcasterHolder[roomId].studentStream)
      ) {
        // Find the student based on socket.id and update audioStat
        const studentToUpdate = broadcasterHolder[roomId].studentStream.find(
          (student) => student.socketId === socket.id
        );

        if (studentToUpdate) {
          studentToUpdate.audioStat = true;

          // Broadcast the updated student audio status to others in the room
          socket.broadcast
            .to(roomId)
            .emit("student audio stat", true, socket.id);
        }
      }
    });

    socket.on("off student audio", (roomId) => {
      // Check if studentStream exists and is an array
      if (
        broadcasterHolder[roomId].studentStream &&
        Array.isArray(broadcasterHolder[roomId].studentStream)
      ) {
        // Find the student based on socket.id and update audioStat
        const studentToUpdate = broadcasterHolder[roomId].studentStream.find(
          (student) => student.socketId === socket.id
        );

        if (studentToUpdate) {
          studentToUpdate.audioStat = false;

          // Broadcast the updated student audio status to others in the room
          socket.broadcast
            .to(roomId)
            .emit("student audio stat", false, socket.id);
        }
      }
    });
    socket.on("disable student audio", (roomId, studentSocketId) => {
      // Check if studentStream exists and is an array
      if (
        broadcasterHolder[roomId].studentStream &&
        Array.isArray(broadcasterHolder[roomId].studentStream)
      ) {
        // Find the student based on socket.id and update audioStat
        const studentToUpdate = broadcasterHolder[roomId].studentStream.find(
          (student) => student.socketId === studentSocketId
        );

        if (studentToUpdate) {
          studentToUpdate.audioStat = false;

          // Broadcast the updated student audio status to others in the room
          socket.broadcast
            .to(studentSocketId)
            .emit("student audio stat", false, studentSocketId);
        }
      }
    });

    socket.on("endstream", async (roomid) => {
      // Check if the socket is a broadcaster
      const socketId = socket.id;
      let endLiveWebinar = await LiveWebinar.findOne({ streamKey: roomid });
      if (endLiveWebinar) {
        endLiveWebinar.isLive = false;
        endLiveWebinar.endStatus = true;
        await endLiveWebinar.save();
      }

      Object.entries(broadcasterHolder).forEach(
        async ([roomId, broadcaster]) => {
          if (broadcaster.socketId === socketId) {
            // The disconnected socket was a broadcaster
            socket.broadcast.to(roomId).emit("broadcaster-disconnected");
            if (freeTimers[roomId]) {
              let liveWebinar = await LiveWebinar.findOne({
                streamKey: roomId,
              });

              if (liveWebinar) {
                liveWebinar.timeleft = freeTimers[roomId];
                // liveWebinar.isLive = false;
                liveWebinar.endStatus = true;
                await liveWebinar.save();

                clearInterval(timerControl[roomId]);
                delete timerControl[roomId];
                delete pollQuizHolder[roomId];
                delete freeTimers[roomId];
                // await LiveWebinar.findByIdAndRemove(liveWebinar._id);
              }
            }
            delete broadcasterHolder[roomId];
            delete broadcasterScreen[roomId];
          }
        }
      );
    });
    socket.on("disconnect", async () => {
      // Check if the socket is a broadcaster
      const socketId = socket.id;
      for (const roomId in roomsHolder) {
        // Check if the user's attendanceId is in the room's Set
        if (roomsHolder[roomId].has(socket.attendanceId)) {
          // Remove the attendanceId from the Set
          roomsHolder[roomId].delete(socket.attendanceId);

          // Count the number of people in the room after the user disconnects
          const numberOfPeopleInRoom = roomsHolder[roomId].size;
        }
      }

      Object.entries(broadcasterHolder).forEach(
        async ([roomId, broadcaster]) => {
          if (broadcasterHolder[roomId].studentStream) {
            const students = broadcasterHolder[roomId]?.studentStream;
            const studentIndex = students.findIndex(
              (student) => student.socketId === socketId
            );

            if (studentIndex !== -1) {
              // Remove the student from the array
              const removedStudent = students.splice(studentIndex, 1)[0];

              // Emit the event that the speaking student has left
              io.in(roomId).emit(
                "speaking student has left",
                removedStudent.socketId
              );
            }
          }

          if (broadcaster.socketId === socketId) {
            // The disconnected socket was a broadcaster
            delete broadcasterHolder[roomId];
            delete broadcasterScreen[roomId];
            socket.broadcast.to(roomId).emit("broadcaster-disconnected");
            if (freeTimers[roomId]) {
              let liveWebinar = await LiveWebinar.findOne({
                streamKey: roomId,
              });

              if (liveWebinar) {
                liveWebinar.timeleft = freeTimers[roomId];
                await liveWebinar.save();
                clearInterval(timerControl[roomId]);
                delete timerControl[roomId];

                delete freeTimers[roomId];
              }
            }
            delete broadcasterHolder[roomId];
          } else {
            io.in(roomId).emit("watcher-exit", socketId);
          }
        }
      );
      clearInterval(heartbeatCheckInterval);
    });
  });

  return server;
};

export default setupSocketIO;
