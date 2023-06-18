"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.io = void 0;

var _path = _interopRequireDefault(require("path"));

var _express = _interopRequireDefault(require("express"));

var _connection = _interopRequireDefault(require("./config/connection"));

var _cloudinary = _interopRequireDefault(require("cloudinary"));

var _socketAuthMiddleware = _interopRequireDefault(require("./middleware/socketAuthMiddleware"));

var _socket = require("socket.io");

var _http = _interopRequireDefault(require("http"));

var _user = _interopRequireDefault(require("./routes/user"));

var _school = _interopRequireDefault(require("./routes/school"));

var _coursetype = _interopRequireDefault(require("./routes/coursetype"));

var _producttype = _interopRequireDefault(require("./routes/producttype"));

var _course = _interopRequireDefault(require("./routes/course"));

var _coursechapter = _interopRequireDefault(require("./routes/coursechapter"));

var _courseunit = _interopRequireDefault(require("./routes/courseunit"));

var _message = _interopRequireDefault(require("./routes/message"));

var _theme = _interopRequireDefault(require("./routes/theme"));

var _themepreview = _interopRequireDefault(require("./routes/themepreview"));

var _comment = _interopRequireDefault(require("./routes/comment"));

var _note = _interopRequireDefault(require("./routes/note"));

var _reply = _interopRequireDefault(require("./routes/reply"));

var _student = _interopRequireDefault(require("./routes/student"));

var _bankdetails = _interopRequireDefault(require("./routes/bankdetails"));

var _studentcourse = _interopRequireDefault(require("./routes/studentcourse"));

var _savedcourse = _interopRequireDefault(require("./routes/savedcourse"));

var _notification = _interopRequireDefault(require("./routes/notification"));

var _notificationupdate = _interopRequireDefault(require("./routes/notificationupdate"));

var _order = _interopRequireDefault(require("./routes/order"));

var _wallet = _interopRequireDefault(require("./routes/wallet"));

var _paymentplans = _interopRequireDefault(require("./routes/paymentplans"));

var _studentnotification = _interopRequireDefault(require("./routes/studentnotification"));

var _studentnotificationupdate = _interopRequireDefault(require("./routes/studentnotificationupdate"));

var _section = _interopRequireDefault(require("./routes/section"));

var _report = _interopRequireDefault(require("./routes/report"));

var _pagevisit = _interopRequireDefault(require("./routes/pagevisit"));

var _webhooks = _interopRequireDefault(require("./routes/webhooks"));

var _prelaunchemail = _interopRequireDefault(require("./routes/prelaunchemail"));

var _tutorial = _interopRequireDefault(require("./routes/tutorial"));

var _courseverificationapplication = _interopRequireDefault(require("./routes/courseverificationapplication"));

var _affiliates = _interopRequireDefault(require("./routes/affiliates"));

var _product = _interopRequireDefault(require("./routes/product"));

var _studentproduct = _interopRequireDefault(require("./routes/studentproduct"));

var _rootcategory = _interopRequireDefault(require("./routes/rootcategory"));

var _logvisit = _interopRequireDefault(require("./routes/logvisit"));

var _tutor = _interopRequireDefault(require("./routes/tutor"));

var _livewebinar = _interopRequireDefault(require("./routes/livewebinar"));

var _Livewebinar = _interopRequireDefault(require("./models/Livewebinar"));

var _studentwebinar = _interopRequireDefault(require("./routes/studentwebinar"));

var _console = require("console");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_cloudinary.default.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = (0, _express.default)();
const PORT = process.env.PORT || 5000;

const server = _http.default.createServer(app);

const io = new _socket.Server(server, {
  cors: {
    // origin: "http://localhost:3000",
    origin: "*"
  }
}); // live stream
// io.use(socketAuthMiddleware);

exports.io = io;
const timers = {};
const newWatcherHolder = {};
const newBroadcasterHolder = {};
let screenSharing = false;
let screenStream = null;
io.on("connection", socket => {
  let currentRoom;
  let broadcasterId;
  const watchers = {};
  const wathcersArray = ["cds"];
  const broadcasters = {}; // socket.on("broadcaster", async (roomId) => {
  //   broadcasterId = socket.id;
  //   currentRoom = roomId;
  //   let liveWebinar = await LiveWebinar.findOne({ streamKey: roomId });
  //   liveWebinar.isLive = true;
  //   await liveWebinar.save();
  //   socket.join(roomId);
  //   socket.broadcast.to(roomId).emit("broadcaster");
  // });
  // socket.on("watcher", async (roomId, userId) => {
  //   console.log(newBroadcasterHolder)
  //   socket.join(roomId);
  //   var room = io.sockets.adapter.rooms;
  //   let roomSize = room.get(roomId).size || 1;
  //   socket.to(socket.id).emit("for your eyes only", roomSize);
  //   socket.broadcast.to(roomId).emit("watcher", userId, roomSize);
  //   wathcersArray.push({ id: socket.id, roomId, user: userId });
  //   watchers[socket.id] = { roomId, user: userId };
  //   if (broadcasters[roomId]) {
  //     socket.emit("broadcaster", broadcasters[roomId]);
  //   }
  //   let liveWebinar = await LiveWebinar.findOne({ streamKey: roomId });
  //   if (liveWebinar.isLive === true) {
  //     // user can join meeting
  //     socket.broadcast.to(roomId).emit("watcher", userId, roomSize);
  //   } else {
  //     socket.broadcast.to(roomId).emit("waiting for broadcaster");
  //   }
  // });

  socket.on("broadcaster", async (roomId, peerId) => {
    newBroadcasterHolder[roomId] = peerId;
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("broadcaster");
  });
  socket.on("watcher", async (roomId, userId) => {
    console.log(newBroadcasterHolder);
    socket.join(roomId);
    const room = io.sockets.adapter.rooms.get(roomId);
    let roomSize = room ? room.size : 1; // check screensharing

    if (newBroadcasterHolder[roomId]) {
      console.log(newBroadcasterHolder[roomId]);
      io.in(roomId).emit("join stream", roomSize, newBroadcasterHolder[roomId]); // io.in(roomid).
    } else {
      socket.emit("no stream");
    }
  });
  socket.on('startScreenSharing', roomId => {
    screenSharing = true;
    io.in(roomId).emit('screenSharingStatus', true);
  });
  socket.on('stopScreenSharing', roomId => {
    screenSharing = false;
    io.in(roomId).emit('screenSharingStatus', false);
  });
  socket.on("end-stream", roomId => {
    socket.broadcast.to(roomId).emit("end-stream");
  }); //

  socket.on("screensharing", roomId => {
    socket.broadcast.to(roomId).emit("screensharing");
  });
  socket.on("screenPeer", (roomId, peerId) => {
    socket.broadcast.to(roomId).emit("screenPeer", peerId);
  });
  socket.on("returnPeer", (roomId, peerId) => {
    socket.broadcast.to(roomId).emit("returnPeer", peerId);
  });
  socket.on("message", (message, roomId) => {
    socket.broadcast.to(roomId).emit("message", { ...message
    });
  });
  socket.on("special close", (roomid, index) => {
    socket.broadcast.to(roomid).emit("special close", index);
  });
  socket.on("special submit", (type, result, roomId, user, questionControl) => {
    socket.broadcast.to(roomId).emit("special submit", type, result, user, questionControl);
  });
  socket.on("startTimer", timerData => {
    const {
      duration,
      questionControl,
      roomid
    } = timerData; // Check if a timer is already running for the same room and question

    if (timers[roomid] && timers[roomid][questionControl]) {
      socket.emit("timerError", "A timer is already running for this question.");
      return;
    } // Create a new timer for the room and question


    if (!timers[roomid]) {
      timers[roomid] = {};
    }

    timers[roomid][questionControl] = {
      duration: duration,
      remainingTime: duration
    }; // Broadcast the start event to all connected clients in the room

    io.in(roomid).emit("timerStarted", questionControl, duration); // socket.to(roomid).emit("timerStarted", questionControl, duration);
    // Start the countdown

    const timer = setInterval(() => {
      timers[roomid][questionControl].remainingTime -= 1; // Broadcast the remaining time to all connected clients in the room

      io.in(roomid).emit("timerTick", questionControl, timers[roomid][questionControl].remainingTime);

      if (timers[roomid][questionControl].remainingTime <= 0) {
        clearInterval(timer);
        io.in(roomid).emit("timerEnded", questionControl); // Clean up the timer after it ends

        delete timers[roomid][questionControl];
      }
    }, 1000);
  });
  socket.on("updatedPollResult", (roomid, updatedResults, questionControl) => {
    io.in(roomid).emit("updatedPollResult", updatedResults, questionControl);
  }); // socket.on("startTimer",(timerData)=>{
  //   const { duration, questionControl, roomid } = timerData;
  //   // Check if a timer is already running for the same room and question
  //   if (timers[roomid] && timers[roomid][questionControl]) {
  //     socket.emit('timerError', 'A timer is already running for this question.');
  //     return;
  //   }
  //   // Create a new timer for the room and question
  //   if (!timers[roomid]) {
  //     timers[roomid] = {};
  //   }
  //   timers[roomid][questionControl] = {
  //     duration: duration,
  //     remainingTime: duration,
  //   };
  //   // Broadcast the start event to all connected clients in the room
  //   socket.to(roomid).emit('timerStarted', questionControl, duration);
  // // Start the countdown
  // const timer = setInterval(() => {
  //   timers[roomid][questionControl].remainingTime -= 1;
  //   // Broadcast the remaining time to all connected clients in the room
  //   socket.to(roomid).emit(
  //     'timerTick',
  //     questionControl,
  //     timers[roomid][questionControl].remainingTime
  //   );
  //   if (timers[roomid][questionControl].remainingTime <= 0) {
  //     clearInterval(timer);
  //     socket.to(roomid).emit('timerEnded', questionControl);
  //     // Clean up the timer after it ends
  //     delete timers[roomid][questionControl];
  //   }
  // }, 1000);
  // })

  socket.on("disconnect", async () => {
    // on broadcaster disconnected
    if (broadcasterId === socket.id) {
      let liveWebinar = await _Livewebinar.default.findOne({
        streamKey: currentRoom
      });
      let timeStamp = Date.now();
      let timeUpdate;
      const timeDifferenceInSeconds = Math.floor((timeStamp - liveWebinar.streamStarted) / 1000);

      if (liveWebinar.timeleft === 0) {// timeUpdate = 2700 - timeDifferenceInSeconds;
        // liveWebinar.timeleft = timeUpdate;
        // delete webinar
      }

      liveWebinar.timeleft = liveWebinar.timeleft - timeDifferenceInSeconds;
      liveWebinar.isLive = false;
      await liveWebinar.save();
      socket.broadcast.to(currentRoom).emit("broadcaster-disconnected");
    }

    if (watchers[socket.id]) {
      const {
        roomId,
        user
      } = watchers[socket.id];
      delete watchers[socket.id];
      socket.leave(roomId);
      var room = io.sockets.adapter.rooms;
      let roomSize = room.get(roomId).size;
      socket.to(roomId).emit("user-disconnected", user, roomSize);
    } // it should be possible to get the user id

  });
}); // middle ware to exclude cloudflare webhooks endpoint path
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

app.use(unless("/api/v1/webhooks/cloudflare/upload/success/notification", _express.default.json({
  extended: false
}))); // call database instance

(0, _connection.default)(); // app.get('/', (req, res) => {
//   res.send("welcome to our api")
// })
// all application routes will accessed from here

app.use("/api/v1/user", _user.default);
app.use("/api/v1/school", _school.default);
app.use("/api/v1/coursetype", _coursetype.default);
app.use("/api/v1/producttype", _producttype.default);
app.use("/api/v1/course", _course.default);
app.use("/api/v1/coursechapter", _coursechapter.default);
app.use("/api/v1/courseunit", _courseunit.default);
app.use("/api/v1/message", _message.default);
app.use("/api/v1/theme", _theme.default);
app.use("/api/v1/themepreview", _themepreview.default);
app.use("/api/v1/bank", _bankdetails.default);
app.use("/api/v1/comment", _comment.default);
app.use("/api/v1/reply", _reply.default);
app.use("/api/v1/note", _note.default);
app.use("/api/v1/student", _student.default);
app.use("/api/v1/studentcourse", _studentcourse.default);
app.use("/api/v1/savedcourse", _savedcourse.default);
app.use("/api/v1/notification", _notification.default);
app.use("/api/v1/notificationupdate", _notificationupdate.default);
app.use("/api/v1/student/notification", _studentnotification.default);
app.use("/api/v1/student/notificationupdate", _studentnotificationupdate.default);
app.use("/api/v1/order", _order.default);
app.use("/api/v1/wallet", _wallet.default);
app.use("/api/v1/paymentplans", _paymentplans.default);
app.use("/api/v1/section", _section.default);
app.use("/api/v1/report", _report.default);
app.use("/api/v1/pagevisit", _pagevisit.default);
app.use("/api/v1/webhooks", _webhooks.default);
app.use("/api/v1/prelaunch", _prelaunchemail.default);
app.use("/api/v1/tutorial", _tutorial.default);
app.use("/api/v1/courseverification", _courseverificationapplication.default);
app.use("/api/v1/affiliate", _affiliates.default);
app.use("/api/v1/product", _product.default);
app.use("/api/v1/studentproduct", _studentproduct.default);
app.use("/api/v1/rootcategory", _rootcategory.default);
app.use("/api/v1/log-visit", _logvisit.default);
app.use("/api/v1/tutor", _tutor.default);
app.use("/api/v1/livewebinar", _livewebinar.default);
app.use("/api/v1/studentwebinar", _studentwebinar.default);

const root = require("path").join(__dirname, "../client", "build"); // block of code come's after application routes


if (process.env.NODE_ENV === "production") {
  // set static files
  // app.use(express.static("client/build"));
  // app.get("/*", (req, res) => {
  //   res.sendFile(path.join(__dirname, "../client", "build", "index.html"));
  // });
  app.use(_express.default.static(root));
  app.get("*", (req, res) => {
    res.sendFile("index.html", {
      root
    });
  });
}

server.listen(PORT, () => console.log(`App is Listenng on port ${PORT}`));