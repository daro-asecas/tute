// Rebusque para que funcione localmente y onlinemente sin modificar los archivos
const server = typeof(serverURL)!="undefined"?serverURL:"http://localhost:5000";  // esto es porque en NETLIFY hay un SnippetInjection de esta variable!!
const sock = io(server);

// Generando un ID para el dispositivo
if (!(localStorage.userId)) {
  sock.emit("newUser")
  sock.on("id", (id) => { localStorage.userId = id.toString() })
}


// Guardar nombre de usuario, por ahora lo dejo comentado para mas adelante
// let userName = localStorage.userName;
// if (userName) {
// } else {
//   userName = prompt("¿Please type your name?", "");
//   localStorage.setItem("userName",userName);
// }




// window.addEventListener("beforeunload", function () {
//   sock.emit("closingTab")
// });