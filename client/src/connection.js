// Rebusque para que funcione localmente y onlinemente sin modificar los archivos
const server = typeof(serverURL)!="undefined"?serverURL:"http://localhost:5000";  // esto es porque en NETLIFY hay un SnippetInjection de esta variable!!
const sock = io(server);

// Guardar nombre de usuario, por ahora lo dejo comentado para mas adelante
// let userName = localStorage.userName;
// if (userName) {
// } else {
//   userName = prompt("¿Cual es tu nombre?", "");
//   localStorage.setItem("userName",userName);
// }