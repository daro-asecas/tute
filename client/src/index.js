const createBtn = document.querySelector("#create-btn");
const joinBtn = document.querySelector("#join-btn");
const input =  document.querySelector("#game-code");
const form =  document.querySelector("#join-form");

const createGame = () => {
  createBtn.addEventListener("click", () => {
    sock.emit("joinRoom","");
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

function redirect(roomName) {
  window.location.replace(`../html/match.html?match=${roomName}`);
}
sock.on("redirect", redirect)

function fullRoom() {
  let full = document.createElement("div")
  full.innerText("Game already started")
  form.appendChild("full")
}
sock.on("fullRoom", fullRoom)

createGame();
joinGame();