// Rebusque para que funcione localmente y onlinemente sin modificar los archivos

const serverURL = (window.location.href.slice(0, 21)==="http://localhost:8080")
  ? "http://localhost:8080"
  : "https://tute-online.herokuapp.com/"

const sock = io(serverURL);


// Guardar nombre de usuario
let userName = localStorage.userName;
if (userName) {
} else {
  userName = prompt("¿Cual es tu nombre?", "");
  localStorage.setItem("userName",userName);
}