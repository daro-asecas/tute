// Rebusque para que funcione localmente y onlinemente sin modificar los archivos

// const serverURL = (window.location.href.slice(0, 21)==="http://localhost:5000") ? "http://localhost:5000" : "https://tute-online.herokuapp.com/"
// const serverURL = (typeof(process)!="undefined" && typeof(process.env)!="undefined" && process.env.SERVER_URL!="undefined")? process.env.SERVER_URL : "http://localhost:5000"

// if(typeof(serverURL)=="undefined") { 
//   console.log("entra2")
  const serverURL = "http://localhost:5000" // } // esto es porque en NETLIFY hay un SnippetInjection de esta variable!!
  const sock = io(serverURL);

// Guardar nombre de usuario, por ahora lo dejo comentado para mas adelante
// let userName = localStorage.userName;
// if (userName) {
// } else {
//   userName = prompt("¿Cual es tu nombre?", "");
//   localStorage.setItem("userName",userName);
// }