const Match = require("./models/match");
const User = require("./models/user");

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
let userId = 0
const newGameId = ((length) => {
  let id = ""
  for ( let i=0; i<length ; i++ ) {
    let index = Math.floor(Math.random()*CHARACTER_SET.length)
    id = id.concat(CHARACTER_SET[index])
  }
  if(id in matches) { return newGameId(length)
  } else { return id }
})

  const io = socketio(server, {
  cors: {
    origin: ["https://tute-online.netlify.app"],
  }
});
module.exports = io;

let rooms = {}
let matches = {}
let users = []


// Cuando alguien entra
io.on("connection", (sock) => {
  console.log("Someone in")
  sock.emit("handshake")
  sock.on("returnHandshake", (connection) => {
    if(connection === 0) {
      
      sock.emit("message", "Welcome!", "server")
    } else {
      sock.emit("message", "Server reconected!", "server")
    }
    
  })


  sock.on("newUser", () => {
    userId = userId + 1
    sock.emit("id", userId)
    users[userId] = new User ()
  })
  
  sock.on("sendingUserData", (userId, userName) => {
    if (users[userId] instanceof User) {
      users[userId].newName(userName)
    } else {
      users[userId] = new User (userId, userName)
    }
    sock.name = userName
  })

  sock.on("newUserName", (userId, userName) => {
    users[userId].newName(userName)
    sock.name = userName
    matches[sock.match].emitEventToAllPlayers("updatePlayerList", matches[sock.match].humanPlayerNames)

  })


  // Para crear una sala
  sock.on("createRoom", () => {
    const match = newGameId(ID_LENGTH);
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
  sock.on("joinGame", (gameId, userId) => {
    let roomName = gameId


    // Si el usuario ya pertenecia al juego (actualiza la pagina por ejemplo) 
    if (roomName in matches && matches[roomName].humanPlayersId.includes(userId)) {
      sock.join(roomName)
      sock.match = roomName
      matches[roomName].reJoinRoom(sock, userId)

    } else if ( roomName in matches && matches[roomName].isGameStarted) {      // Acá van todos los chequeos de error
      sock.emit("error", "spectatorsNotAllowed")
    } else {

      // Si es el primero de la sala, la crea
      if (!(roomName in matches)) {
        matches[roomName] = new Match(roomName, sock,userId)
        } else { matches[roomName].joinRoom(sock, userId) }

      sock.join(roomName)
      sock.match = roomName

      // sock.on("closingTab", async () => {
      //   console.log("closing Tab")

        // matches[roomName].leaveRoom(sock)
        // if(matches[roomName].numberOfHumanPlayers === 0) {
        //   let promise = new Promise((resolve, reject) => {
        //     setTimeout(() => resolve("done!"), 5*60*1000)
        //   });
        //   let result = await promise;
        //   if(matches[roomName].numberOfHumanPlayers === 0) { delete matches[roomName] }
        // }
      // })
    }
  })

  sock.on("disconnect", () => {})


  // Para el chat
  sock.on("message", (text, room) => {
    sock.emit("message", text, "me")
    sock.to(room).emit("message", text, "other")
  });

  // Para el admin
  sock.on("command", (text) => {
    response = "" // hacer esto
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