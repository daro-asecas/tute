const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");

const Match = require("./models/match");

const app = express();

const clientPath = `${__dirname}/../client`;

app.use(express.static(clientPath));

const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: ["https://tute-online.netlify.app", "localhost:8000"],
  }
});

let waitingPlayer = null;

io.on("connection", (sock) => {
  console.log("Someone in")
  if (waitingPlayer) {
    io.emit("message", ["Match starts", "server"])
    new Match(waitingPlayer, sock);
    waitingPlayer = null;
  } else {
    sock.emit("message", ["To try the app open it in two tabs", "server"])
    waitingPlayer = sock;
  }
  
  sock.on("message", (text) => {
    sock.emit("message", [text, "me"])
    sock.broadcast.emit("message", [text, "other"])
  });

});

server.on("error", (err) => {
  console.error("Server error: ", err);
});

server.listen(process.env.PORT || 8000, () => {});