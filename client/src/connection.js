// Rebusque para que funcione localmente y onlinemente sin modificar los archivos

// const serverURL = (window.location.href.slice(0, 21)==="http://localhost:5000")
//   ? "http://localhost:5000"
//   : "https://tute-online.herokuapp.com/"

// si esto esta superado se puede eliminar
// let serverURL;
// if (process && !!process.env && !!process.env.SERVERURL) { serverURL = process.env.SERVERURL
// } else { serverURL = "http://localhost:5000" }

// const serverURL = (process && process.env && process.env.SERVERURL || "http://localhost:5000")
    
const serverURL = (typeof(process)!="undefined" && typeof(process.env)!="undefined" && proces.env.SERVERURL)? process.env.SERVERURL : "http://localhost:5000"
const sock = io(serverURL);
const titulo = document.querySelector("h1")
titulo.innerHTML = serverURL
// console.log(serverURL);


// Guardar nombre de usuario, por ahora lo dejo comentado para mas adelante
// let userName = localStorage.userName;
// if (userName) {
// } else {
//   userName = prompt("¿Cual es tu nombre?", "");
//   localStorage.setItem("userName",userName);
// }