// Rebusque para que funcione localmente y onlinemente sin modificar los archivos

// const serverURL = (window.location.href.slice(0, 21)==="http://localhost:5000")
//   ? "http://localhost:5000"
//   : "https://tute-online.herokuapp.com/"

// si esto esta superado se puede eliminar
// let serverURL;
// if (process && !!process.env && !!process.env.SERVER_URL) { serverURL = process.env.SERVER_URL
// } else { serverURL = "http://localhost:5000" }

// const serverURL = (process && process.env && process.env.SERVER_URL || "http://localhost:5000")
// const serverURL = (typeof(process)!="undefined" && typeof(process.env)!="undefined" && process.env.SERVER_URL!="undefined")? process.env.SERVER_URL : "http://localhost:5000"

if(!serverURL) { const serverURL = "http://localhost:5000" }
console.log(serverURL);

const sock = io(serverURL);
const titulo = document.querySelector("h1")
titulo.innerHTML = `variable:${serverURL}`


// Guardar nombre de usuario, por ahora lo dejo comentado para mas adelante
// let userName = localStorage.userName;
// if (userName) {
// } else {
//   userName = prompt("¿Cual es tu nombre?", "");
//   localStorage.setItem("userName",userName);
// }