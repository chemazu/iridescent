import path from "path";
import express from "express";
import connectDB from "./config/connection";

import cloudinary from "cloudinary";

import { Server } from "socket.io";
import http from "http";

import userRoute from "./routes/user";
import schoolRoute from "./routes/school";
import courseTypeRoute from "./routes/coursetype";
import productTypeRoute from "./routes/producttype";
import CourseRoute from "./routes/course";
import courseChapterRoute from "./routes/coursechapter";
import courseUnitRoute from "./routes/courseunit";
import messageRoute from "./routes/message";
import themeRoute from "./routes/theme";
import themePreviewRoute from "./routes/themepreview";
import commentRoute from "./routes/comment";
import noteRoute from "./routes/note";
import replyRoute from "./routes/reply";
import studentRoute from "./routes/student";
import bankRoute from "./routes/bankdetails";
import studentCourseRoute from "./routes/studentcourse";
import savedCourseRoute from "./routes/savedcourse";
import notificationRoute from "./routes/notification";
import notificationUpdateRoute from "./routes/notificationupdate";
import orderRoute from "./routes/order";
import walletRoute from "./routes/wallet";
import paymentplansRoute from "./routes/paymentplans";
import studentNotificationRoute from "./routes/studentnotification";
import studentNotificationUpdate from "./routes/studentnotificationupdate";
import sectionsRoute from "./routes/section";
import reportsRoute from "./routes/report";
import pagevisitRoute from "./routes/pagevisit";
import webhooksRoute from "./routes/webhooks";
import prelaunchRoute from "./routes/prelaunchemail";
import tutorialRoute from "./routes/tutorial";
import courseVerificationRoute from "./routes/courseverificationapplication";
import affiliateRoute from "./routes/affiliates";
import productRoute from "./routes/product";
import studentProductRoute from "./routes/studentproduct";
import rootCategoryRoute from "./routes/rootcategory";
import logVisitRoute from "./routes/logvisit";
import tutorRoute from "./routes/tutor";
import classroomresourcesRoute from "./routes/classroomresources";
import livewebinarRoute from "./routes/livewebinar";

import LiveWebinar from "./models/Livewebinar";
import studentWebinarRoute from "./routes/studentwebinar";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    // origin: "http://localhost:3000",
    origin: "*",
  },
});

// live stream
// io.use(socketAuthMiddleware);
const timers = {};
const timerControl = {};
const newWatcherHolder = {};
const newBroadcasterHolder = {};
let screenSharing = false;
const freeTimers = {};
let pollQuizHolder = {};
let broadcasterScreen = {};
io.on("connection", (socket) => {
  socket.on("broadcaster", async (roomId, peerId) => {
    newBroadcasterHolder[roomId] = { peerId, socketId: socket.id };
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("broadcaster");
  });
  socket.on("disablevideo", (roomId, status) => {
    io.in(roomId).emit("disablevideo", status);
    broadcasterScreen[roomId] = status;
  });
  socket.on("freeTimer", async (roomId) => {
    if (freeTimers[roomId] || timerControl[roomId]) {
      return;
    }
    if (!freeTimers[roomId]) {
      let liveWebinar = await LiveWebinar.findOne({ streamKey: roomId });
      if (liveWebinar) {
        if (liveWebinar.timeleft === 0) {
          io.in(roomId).emit("timer elapsed for room", 0);
        } else {
          freeTimers[roomId] = liveWebinar.timeleft;
          let timer = setInterval(() => {
            if (freeTimers[roomId] === 0) {
              clearInterval(timer);
              // Perform any necessary cleanup or actions when the timer ends

              // For example, emit an event to indicate the timer has ended
              io.in(roomId).emit("freeTimerEnded", roomId);

              // Clear the timer and remove the timer control from the objects
              clearInterval(timerControl[roomId]);
              delete timerControl[roomId];
              delete freeTimers[roomId];

              // Update the liveWebinar object if needed
              liveWebinar.timeleft = 0;
              liveWebinar.save((error) => {
                if (error) {
                  console.error("Error saving liveWebinar:", error);
                }
              });
            } else {
              io.in(roomId).emit("roomTimerTick", freeTimers[roomId]);
              freeTimers[roomId]--;
            }
          }, 1000);
          // Store the timer and timer control in the respective objects
          timerControl[roomId] = timer;
        }
      }
    }
  });

  // socket.on("disconnect", () => {
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
    if (newBroadcasterHolder[roomId]) {
      io.in(roomId).emit(
        "join stream",
        roomSize,
        newBroadcasterHolder[roomId].peerId
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
        pollQuizHolder[roomId],
        broadcasterScreen[roomId]
      );
    } else {
      io.to(socket.id).emit("no stream");
    }
  });

  socket.on("startScreenSharing", (roomId) => {
    screenSharing = true;
    io.in(roomId).emit("screenSharingStatus", true);
  });

  socket.on("stopScreenSharing", (roomId) => {
    screenSharing = false;
    io.in(roomId).emit("screenSharingStatus", false);
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

  socket.on("disconnect", async () => {
    // Check if the socket is a broadcaster
    const socketId = socket.id;

    Object.entries(newBroadcasterHolder).forEach(
      async ([roomId, broadcaster]) => {
        if (broadcaster.socketId === socketId) {
          // The disconnected socket was a broadcaster
          delete pollQuizHolder[roomId];
          delete timers[roomId];

          socket.broadcast.to(roomId).emit("broadcaster-disconnected");
          if (freeTimers[roomId]) {
            let liveWebinar = await LiveWebinar.findOne({ streamKey: roomId });
            if (liveWebinar) {
              liveWebinar.timeleft = freeTimers[roomId];
              liveWebinar.isLive = false;
              await liveWebinar.save();
              // clearInterval(timerControl[roomId]);
              // delete timerControl[roomId];
              delete pollQuizHolder[roomId];
              // delete freeTimers[roomId];
              clearInterval(timerControl[roomId]);
              delete timerControl[roomId];
              delete timers[roomId];

              delete freeTimers[roomId];
            }
          }
          delete newBroadcasterHolder[roomId];
        }
      }
    );
  });
  socket.on("endstream", async () => {
    // Check if the socket is a broadcaster
    const socketId = socket.id;

    Object.entries(newBroadcasterHolder).forEach(
      async ([roomId, broadcaster]) => {
        if (broadcaster.socketId === socketId) {
          // The disconnected socket was a broadcaster
          socket.broadcast.to(roomId).emit("broadcaster-disconnected");
          if (freeTimers[roomId]) {
            let liveWebinar = await LiveWebinar.findOne({ streamKey: roomId });

            if (liveWebinar) {
              // liveWebinar.timeleft = freeTimers[roomId];
              // liveWebinar.isLive = false;

              // await liveWebinar.save();

              clearInterval(timerControl[roomId]);
              delete timerControl[roomId];
              delete pollQuizHolder[roomId];
              delete freeTimers[roomId];
              await LiveWebinar.findByIdAndRemove(liveWebinar._id);

            }
          }
          delete newBroadcasterHolder[roomId];
        }
      }
    );
  });
});

// middle ware to exclude cloudflare webhooks endpoint path
// from app.use(express.json()) middleware
const unless = function (path, middleware) {
  return function (req, res, next) {
    if (path === req.path) {
      return next();
    } else {
      return middleware(req, res, next);
    }
  };
};

app.use(
  unless(
    "/api/v1/webhooks/cloudflare/upload/success/notification",
    express.json({ extended: false })
  )
);

// call database instance
connectDB();

// app.get('/', (req, res) => {
//   res.send("welcome to our api")
// })

// all application routes will accessed from here
app.use("/api/v1/user", userRoute);
app.use("/api/v1/school", schoolRoute);
app.use("/api/v1/coursetype", courseTypeRoute);
app.use("/api/v1/producttype", productTypeRoute);
app.use("/api/v1/course", CourseRoute);
app.use("/api/v1/coursechapter", courseChapterRoute);
app.use("/api/v1/courseunit", courseUnitRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/theme", themeRoute);
app.use("/api/v1/themepreview", themePreviewRoute);
app.use("/api/v1/bank", bankRoute);
app.use("/api/v1/comment", commentRoute);
app.use("/api/v1/reply", replyRoute);
app.use("/api/v1/note", noteRoute);
app.use("/api/v1/student", studentRoute);
app.use("/api/v1/studentcourse", studentCourseRoute);
app.use("/api/v1/savedcourse", savedCourseRoute);
app.use("/api/v1/notification", notificationRoute);
app.use("/api/v1/notificationupdate", notificationUpdateRoute);
app.use("/api/v1/student/notification", studentNotificationRoute);
app.use("/api/v1/student/notificationupdate", studentNotificationUpdate);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/wallet", walletRoute);
app.use("/api/v1/paymentplans", paymentplansRoute);
app.use("/api/v1/section", sectionsRoute);
app.use("/api/v1/report", reportsRoute);
app.use("/api/v1/pagevisit", pagevisitRoute);
app.use("/api/v1/webhooks", webhooksRoute);
app.use("/api/v1/prelaunch", prelaunchRoute);
app.use("/api/v1/tutorial", tutorialRoute);
app.use("/api/v1/courseverification", courseVerificationRoute);
app.use("/api/v1/affiliate", affiliateRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/studentproduct", studentProductRoute);
app.use("/api/v1/rootcategory", rootCategoryRoute);
app.use("/api/v1/log-visit", logVisitRoute);
app.use("/api/v1/tutor", tutorRoute);
app.use("/api/v1/livewebinar", livewebinarRoute);
app.use("/api/v1/classroomresource", classroomresourcesRoute);

app.use("/api/v1/studentwebinar", studentWebinarRoute);

const root = require("path").join(__dirname, "../client", "build");

// block of code come's after application routes
if (process.env.NODE_ENV === "production") {
  // set static files
  // app.use(express.static("client/build"));

  // app.get("/*", (req, res) => {
  //   res.sendFile(path.join(__dirname, "../client", "build", "index.html"));
  // });
  app.use(express.static(root));
  app.get("*", (req, res) => {
    res.sendFile("index.html", { root });
  });
}

server.listen(PORT, () => console.log(`App is Listenng on port ${PORT}`));
