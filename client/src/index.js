const createBtn = document.querySelector("#create-btn");
const joinBtn = document.querySelector("#join-btn");
const input =  document.querySelector("#game-code");
const errorDiv =  document.querySelector("#error");

const createGame = () => {
  createBtn.addEventListener("click", () => {
    sock.emit("createRoom");
  })
};

const joinGame = () => {
  joinBtn.addEventListener("click", (e) => {
    e.preventDefault()
    if (input.value) {
      sock.emit("joinRoom", input.value);
    };
  })
};

input.addEventListener("keydown", () => {
    errorDiv.innerText = "";
});

function redirect(roomName) {
  window.location.replace(`../html/${roomName}`);
}
sock.on("redirect", redirect)

function showError (msg) {
  errorDiv.innerText = msg
}

function error (error) {
  switch (error) {
    case "fullRoom":
      showError("Game already started")
      break
      case "unexistingRoom":
        showError("Incorrect game ID")   
        break
        case "spectatorsNotAllowed":
          showError("This game does not allow spectators")   
          break

        default:
        sock.emit("serverConsoleLog", "Error parameter unknown")
  }
}
sock.on("error", error)


createGame();
joinGame(); 