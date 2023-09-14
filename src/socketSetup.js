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
  io.on("connection", (socket) => {
    // broadcaster
    socket.on("broadcaster", async (roomId, peerId) => {
      broadcasterHolder[roomId] = { peerId, socketId: socket.id };
      socket.join(roomId);
      socket.broadcast
        .to(roomId)
        .emit("broadcaster", broadcasterHolder[roomId].peerId);
      let currentWebinar = await LiveWebinar.findOne({ streamKey: roomId });
      currentWebinar.isLive = true;
      await currentWebinar.save();
    });

    socket.on("watcher-exit", (roomId) => {
      const room = io.sockets.adapter.rooms.get(roomId);
      let roomSize = room ? room.size : 1;
      io.in(roomId).emit("watcher-exit", roomSize);
    });

    socket.on("watcher", async (roomId, userId) => {
      socket.join(roomId);
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

        io.to(socket.id).emit(
          "join stream",
          roomSize,
          broadcasterHolder[roomId].peerId
        );

        io.in(roomId).emit("watcher", socket.id, roomSize);
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
    });

    socket.on("startScreenSharing", (roomId, peerId) => {
      broadcasterScreen[roomId] = { peerId, socketId: socket.id };
      console.log(broadcasterScreen);
      io.in(roomId).emit("startScreenSharing", peerId);
    });

    socket.on("stopScreenSharing", (roomId) => {
      io.in(roomId).emit("stopScreenSharing");

      delete broadcasterScreen[roomId];
      console.log(broadcasterScreen);
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
      console.log("endstream");
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
                console.log(liveWebinar);
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

      Object.entries(broadcasterHolder).forEach(
        async ([roomId, broadcaster]) => {
          if (broadcaster.socketId === socketId) {
            // The disconnected socket was a broadcaster
            socket.broadcast.to(roomId).emit("broadcaster-disconnected");
            if (freeTimers[roomId]) {
              console.log(freeTimers[roomId]);
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
    });
  });

  return server;
};

export default setupSocketIO;
