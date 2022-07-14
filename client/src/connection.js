//  rebusque para que funcione localmente y onlinemente sin modificar los archivos

const serverURL = (window.location.href=="http://localhost:8000")
  ? "https://tute-online.herokuapp.com/"
  : "http://localhost:8000"

  const sock = io(serverURL);