const http = require("http");
const express = require("express");
const socketio = require("socket.io");
if (process.env.NODE_ENV!=="production") { require("dotenv").config() }

const Match = require("./models/match");

const Room = require("./models/room");

const app = express();

const clientPath = `${__dirname}/../client`;

app.use(express.static(clientPath));

const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: ["https://tute-online.netlify.app", "localhost:8000"],
  }
});

let rooms = {}

// Cuando alguien entra
io.on("connection", (sock) => {
  console.log("Someone in")


  // Para crear una sala
  sock.on("createRoom", () => {
    const match = `match.html?match=${sock.id.slice(0, 5)}`;
    sock.emit("redirect", match);
    sock.emit("message", ["To try the app open it in two tabs", "server"])
  })


  // Para unirse a una sala
  sock.on("joinRoom", (roomName) => {
    if (roomName === process.env.ADMIN) {sock.emit("redirect", "admin.html");
    } else {
      const match = `match.html?match=${roomName}`;

      let clients = io.sockets.adapter.rooms.get(roomName); // clientes metidos ANTES que este sock
      const numClients = clients ? clients.size : 0;


      if (!numClients) {
        sock.emit("error", "unexistingRoom")
      } else if (numClients === 1) {
        sock.emit("redirect", match);
      } else {
        sock.emit("error", "fullRoom")
      }
    }
  })
  
  // Para iniciar el juego <(<( en este punto se JOINEA a la ROOM de SOCKETIO )>)>
  sock.on("joinGame", (roomName) => {
    let roomKey = `room: ${roomName}`
    if (!rooms[roomKey]) {rooms[roomKey] = new Room ()}
    let clients = io.sockets.adapter.rooms.get(roomName); // clientes metidos ANTES que este sock
    rooms[roomKey].numClients = clients ? clients.size : 0;

    if (!rooms[roomKey].numClients) {
      rooms[roomKey].waitingPlayer = sock
      sock.emit("message", ["To try the app open it in two tabs", "server"])
      sock.join(roomName);
    } else if (rooms[roomKey].numClients === 1) {
      sock.join(roomName);
      io.in(roomName).emit("message", ["Match starts", "server"])
      new Match(roomName, rooms[roomKey].waitingPlayer, sock);
      rooms[roomKey].waitingPlayer = null;
      io.in(roomName).emit("matchStart")
    } else {
      sock.emit("error", "fullRoom")
    }

  })
  

  // Para el chat
  sock.on("message", (text, room) => {
    sock.emit("message", [text, "me"])
    sock.to(room).emit("message", [text, "other"])

    // console.log(io.sockets.adapter.rooms)
    //   console.log(io.sockets.adapter.rooms);
    //   console.log(typeof(io.sockets.adapter.rooms));
    //   console.log(sock.rooms)
    //   console.log(rooms)


  });


  // Para el admin
  sock.on("command", (text) => {
    
    response = "" // hacer estoooooooooooooooooooooooooooooooooo
    sock.emit("response", [response, "response"])
  });


  sock.on("requestReload", () => {
    
    rooms.forEach((id) => {
      console.log(id,"  =>  ");
    })
    sock.emit("reload", [])
  });





  // Generica para debuguear
  sock.on("serverConsoleLog", (msg) => {
    console.log(msg);
  });
});


// Funciones básicas del server

server.on("error", (err) => {
  console.error("Server error: ", err);
});

server.listen(process.env.PORT || 8080, () => {});