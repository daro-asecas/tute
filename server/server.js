const Match = require("./models/match");
const Room = require("./models/room");

const http = require("http");
const express = require("express");
const socketio = require("socket.io");
if (process.env.NODE_ENV!=="production") { require("dotenv").config() }
const app = express();
const clientPath = `${__dirname}/../client`;
app.use(express.static(clientPath));
const server = http.createServer(app);

const ID_LENGTH = 5;
const CHARACTER_SET = "abcdefghijklmnopqrstuvwxyz"; // ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // se puede agregar para tener mas IDs
function newId(length) {
  let id = ""
  for ( let i=0; i<length ; i++ ) {
    let index = Math.floor(Math.random()*CHARACTER_SET.length)
    id = id.concat(CHARACTER_SET[index])
  }
  if(id in matches) { return newId(length)
  } else { return id }
}

  const io = socketio(server, {
  cors: {
    origin: ["https://tute-online.netlify.app"],
  }
});
module.exports = io;

let rooms = {}
let matches = {}

// Cuando alguien entra
io.on("connection", (sock) => {
  console.log("Someone in")
  sock.emit("message", ["Welcome to TUTE-ONLINE ", "server"])


  // Para crear una sala
  sock.on("createRoom", () => {
    const match = newId(ID_LENGTH);
    sock.emit("redirect", `match.html?match=${match}`);
  })


  // Para unirse a una sala
  sock.on("joinRoom", (roomName) => {
    if (roomName === process.env.ADMIN) {sock.emit("redirect", "admin.html");
    // } else if (roomName.substring(0,3) === "bot" && typeof(+roomName.substring(3,4)) === "number" && roomName.length === 4) {
    //   const match = `match.html?match=${roomName}`;
    //   sock.emit("redirect", match)
    } else {
      const match = `match.html?match=${roomName}`;

      // let clients = io.sockets.adapter.rooms.get(roomName); // clientes metidos ANTES que este sock
      // const numClients = clients ? clients.size : 0;

      if (!(roomName in matches)) {
        sock.emit("error", "unexistingRoom")
      } else if ( matches[roomName].isGameStarted ) { // && !matches[roomName].allowSpectators ) {  // console.log(corregir esto en caso de aplicar allowSpectators)
        sock.emit("error", "spectatorsNotAllowed")
      } else {
        sock.emit("redirect", match)
      }
    }
  })

  // Para iniciar el juego <(<( en este punto se JOINEA a la ROOM de SOCKETIO )>)>
  sock.on("joinGame", (code) => {
    let roomName = code


    if ( roomName in matches && matches[roomName].isGameStarted) {      // Acá van todos los chequeos de error
      console.log("spectatorsNotAllowed")  
      sock.emit("error", "spectatorsNotAllowed")
    } else {


      // Si es el primero de la sala, crear la nueva Room
      if (!(roomName in matches)) {
        // rooms[roomName] = new Room (roomName, sock)
        matches[roomName] = new Match(roomName, sock)
        } else { matches[roomName].joinRoom(sock) }

      sock.join(roomName);


      sock.on('disconnect', () => {
        matches[roomName].leaveRoom(sock)
        if(matches[roomName].numberOfHumanPlayers === 0) { delete matches[roomName] }
      })
    }
  })


  // Para el chat
  sock.on("message", (text, room) => {
    sock.emit("message", [text, "me"])
    sock.to(room).emit("message", [text, "other"])
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


  // Funcion para debuguear
  sock.on("serverConsoleLog", (msg) => {
    console.log(msg);
  });
});


// Funciones básicas del server

server.on("error", (err) => {
  console.error("Server error: ", err);
});

port = (process.env.PORT || 5000);
server.listen(port, () => {console.log("Listening PORT:",port)});

module.exports = matches