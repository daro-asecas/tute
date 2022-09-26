// Rebusque para que funcione localmente y onlinemente sin modificar los archivos
const server = typeof(serverURL)!="undefined"?serverURL:"http://localhost:5000";  // esto es porque en NETLIFY hay un SnippetInjection de esta variable!!
const sock = io(server);

// Rebusque para que no crashee en celulares cuando queda inactiva la conexion
let connection = 0
sock.on("handshake", () => {
  console.log("llega el handshake")
  console.log("emitiendo returnHandshake")
  sock.emit("returnHandshake", connection)
  connection ++
  const match = new URLSearchParams(window.location.search).get("match");
  if (match) {
    console.log("emitiendo joinGame")
    sock.emit("joinGame", match, localStorage.userId)
  }


})

// document.addEventListener('DOMContentLoaded', (event) => {
//   const match = new URLSearchParams(window.location.search).get("match");
//   let userId = 0
//   if (localStorage.userId) { userId = localStorage.userId }
//   sock.emit("joinGame", match, userId)
// })

// Generando un ID para el dispositivo
if (!(localStorage.userId)) {
  sock.emit("newUser")
  sock.on("id", (id) => { localStorage.userId = id.toString() })
}

// Enviando al server la información de usuario 
sock.emit("sendingUserData", localStorage.userId, localStorage.userName)



// Detectando cierre de pestaña, de todo esto nada funciono
// window.addEventListener('unload', () => {
//   sock.emit("serverConsoleLog", "unload")
//   sock.emit("closingTab")
// })

// window.onbeforeunload = () => {
//   console.log("before unload")
//   sock.emit("serverConsoleLog", "before unload  ")
//   return false;
// }

// window.addEventListener("beforeunload", async () => {
//   console.log("bef unload")
//   await sock.emit("serverConsoleLog", "bef unload")
// })