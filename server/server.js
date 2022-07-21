const http = require("http");
const express = require("express");
const socketio = require("socket.io");
// const cors = require("cors"); creo que no usa esta librería (eliminar y desinstalar)

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

// Cuando alguien entra
io.on("connection", (sock) => {
  console.log("Someone in")


  // Para unirse/crear una sala
  sock.on("joinRoom", (roomName) => {
    const match = roomName || sock.id.slice(0, 5);

    let clients = io.sockets.adapter.rooms.get(roomName); // clientes metidos ANTES que este sock
    const numClients = clients ? clients.size : 0;

    
    if (!numClients) {
      sock.emit("message", ["To try the app open it in two tabs", "server"])
      sock.emit("redirect", match);
    } else if (numClients === 1) {
      sock.emit("redirect", match);
    } else {
      sock.emit("fullRoom")
    }
  })
  
  // Para iniciar el juego
  sock.on("joinGame", (roomName) => {
    let clients = io.sockets.adapter.rooms.get(roomName); // clientes metidos ANTES que este sock
    const numClients = clients ? clients.size : 0;

    if (!numClients) {
      waitingPlayer = sock
      sock.emit("message", ["To try the app open it in two tabs", "server"])
      sock.join(roomName);
    } else if (numClients === 1) {
      sock.join(roomName);
      io.in(roomName).emit("message", ["Match starts", "server"])
      new Match(roomName, waitingPlayer, sock);
      waitingPlayer = null;
    } else {
      sock.emit("fullRoom")
    }

  })
  



  // Para el chat
  sock.on("message", (text, room) => {
    sock.emit("message", [text, "me"])
    sock.to(room).emit("message", [text, "other"])
  });

});


// Funciones básicas del server

server.on("error", (err) => {
  console.error("Server error: ", err);
});

server.listen(process.env.PORT || 8080, () => {});