// Rebusque para que funcione localmente y onlinemente sin modificar los archivos
// const serverURL = (window.location.href.slice(0, 21)==="http://localhost:8080")
//   ? "http://localhost:8080"
//   : "https://tute-online.herokuapp.com/"

// si esto esta superado se puede eliminar

// if (process.env.SERVERURL) {
// } else {
// }

const serverURL = (typeof(process)!="undefined" && typeof(process.env)!="undefined" && proces.env.SERVERURL)? process.env.SERVERURL : "http://localhost:8080"
const sock = io(serverURL);


// Guardar nombre de usuario, por ahora lo dejo comentado para mas adelante
// let userName = localStorage.userName;
// if (userName) {
// } else {
//   userName = prompt("¿Cual es tu nombre?", "");
//   localStorage.setItem("userName",userName);
// }