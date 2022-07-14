//  rebusque para que funcione localmente y onlinemente sin modificar los archivos

const serverURL = (window.location.href=="http://localhost:8000" || "http://localhost:8000/")
  ? "http://localhost:8000"
  : "https://tute-online.herokuapp.com/"

  const sock = io(serverURL);