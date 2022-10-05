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

const showError = ((error) => {
  console.log(error)
  let msg
  switch (error) {
    // case null:
    //   msg = ""
    //   break
    case "unexistingRoom":
      msg = "Incorrect game ID"
      break
      case "openInOtherTab":
        msg = "You opened the game in another tab"
        break
      case "spectatorsNotAllowed":
        msg = "This game does not allow spectators"
        break
      case "kickedOut":
        msg = "You have been kicked out"
        break
    default:
      sock.emit("serverConsoleLog", "Error parameter unknown")
  }
  errorDiv.innerText = msg
})
sock.on("error", showError)


createGame();
joinGame();

document.addEventListener('DOMContentLoaded', (event) => {
  const error = new URLSearchParams(window.location.search).get("error")
  if (!!error) { showError(error) }
})