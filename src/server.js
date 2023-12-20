import path from "path";
import express from "express";

import { ExpressPeerServer } from "peer";
const PORT = process.env.PORT || 5000;

var app = express();
// create express peer server

var options = {
  debug: true,
};

// create a http server instance to listen to request
var server = require("http").createServer(app);

// peerjs is the path that the peerjs server will be connected to.
app.use("/peerjs", ExpressPeerServer(server, options));
// Now listen to your ip and port.

console.log(PORT);
server.listen(PORT, () => console.log(`App is Listenng on port ${PORT}`));
