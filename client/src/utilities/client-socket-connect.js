import { io } from "socket.io-client";
import getServerUrl from "./getServerUrl";

const socket = io(getServerUrl());
// const socket = io(getServerUrl(), {
//   query: { authorization: `Bearer ${localStorage.getItem("token")}` },
// });

export default socket;
