import { Server } from "socket.io";
import http from "http";
import LiveWebinar from "./models/Livewebinar";
import BlockedStudent from "./models/BlockedStudent";

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
  const blockedList = {};

  io.on("connection", (socket) => {
    // broadcaster
    socket.on("broadcaster", async (roomId, peerId, audioStat) => {
      broadcasterHolder[roomId] = { peerId, socketId: socket.id };
      audioStatus[roomId] = audioStat;
      socket.join(roomId);

      socket.broadcast
        .to(roomId)
        .emit("broadcaster", broadcasterHolder[roomId].peerId);
      let currentWebinar = await LiveWebinar.findOne({ streamKey: roomId });

      currentWebinar.isLive = true;
      await currentWebinar.save();
      const blockedStudents = await BlockedStudent.find({
        blockedBy: currentWebinar.creator,
        roomId: roomId,
      });
      console.log(blockedStudents);
      blockedStudents.forEach((item) => {
        // Use the conditional operator to choose either studentId or visitorId
        const id = item.studentId ? item.studentId : item.visitorId;

        if (!blockedList[item.roomId]) {
          blockedList[item.roomId] = [];
        }

        blockedList[item.roomId].push(id.toString());
      });
    });
    socket.on("request audio", (roomId) => {
      const currentSocketId = socket.id;
      socket
        .to(broadcasterHolder[roomId].socketId)
        .emit("request audio", currentSocketId);
    });
    socket.on("student stream", (roomId, peerId, audioStat) => {
      // to handle multiple student make this an array
      broadcasterHolder[roomId].studentStream = {
        peerId,
        audioStat,
        socketId: socket.id,
      };

      socket.broadcast.to(roomId).emit("student stream", peerId, audioStat);
    });
    socket.on("speaking_status", (roomId, status) => {
      console.log(roomId, status, socket.id);

      socket.broadcast
        .to(roomId)
        .emit(
          "speaking_status",
          status,
          socket.id,
          broadcasterHolder[roomId].studentStream?.audioStat
        );
    });
    socket.on("on student audio", (roomid) => {
      console.log(broadcasterHolder[roomid].studentStream);
      broadcasterHolder[roomid].studentStream.audioStat = true;

      socket.broadcast.to(roomid).emit("student audio stat", true);
    });
    socket.on("off student audio", (roomid) => {
      broadcasterHolder[roomid].studentStream.audioStat = false;

      socket.broadcast.to(roomid).emit("student audio stat", false);
    });
    socket.on("watcher-exit", (roomId, attendanceId) => {
      // Check if the room exists in roomsHolder
      if (roomsHolder[roomId]) {
        // Remove the attendanceId from the set
        roomsHolder[roomId].delete(attendanceId);

        // Count the number of people in the room after the user exits
        const numberOfPeopleInRoom = roomsHolder[roomId].size;
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
        registeredUser
      ) => {
        console.log(blockedList, attendanceId);
        console.log(roomId);
        console.log(blockedList[roomId]);
        let blockChecK = blockedList[roomId]?.includes(attendanceId.toString());
        console.log(a);
        if (!blockChecK) {
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
                "active student stream",
                broadcasterHolder[roomId].studentStream.peerId
              );
            }

            io.in(roomId).emit(
              "watcher",
              socket.id,
              peerId,
              userName,
              watcherAvatar,

              attendanceId,
              registeredUser
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
            io.to(socket.id).emit("no stream");
          }
        } else {
          console.log("BLOCKED");
          io.to(socket.id).emit("not allowed");
        }
      }
    );
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
    socket.on("grant student access", (roomid, studentSocketId) => {
      io.to(studentSocketId).emit("start streaming");
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
          }
        }
      );
      clearInterval(heartbeatCheckInterval);
    });
  });

  return server;
};

export default setupSocketIO;
