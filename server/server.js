const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const Match = require("./models/match");

const app = express();

const clientPath = `${__dirname}/../client`;
console.log(`Serving static from: ${clientPath}`);

app.use(express.static(clientPath));

const server = http.createServer(app);

const io = socketio(server);

let waitingPlayer = null;

io.on("connection", (sock) => {
  console.log("Someone in")
  if (waitingPlayer) {
    io.emit("message", ["Match starts", "server"])
    new Match(waitingPlayer, sock);
    waitingPlayer = null;
  } else {
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

server.listen(8000, () => {
  console.log("RPS started on 8000");
});