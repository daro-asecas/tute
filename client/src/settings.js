// const avatars = []   //  tal vez, si lo activo revisar en la fn setResultWrapper
// let myNumber, totalPlayers, playerNames, areAllBots

const settingsWrapper = document.querySelector("#settings-wrapper");
const playerList = document.querySelector("#players-list")
const settingsModifiers = document.querySelectorAll(".settings-modifier")
const modifiersKey = ["allowSpectators", "pointLimit", "pointLimit", "handLosesDouble", "allowRedeal", "playersLimit", "playersLimit", "hitch", "roundLoser"]
const inviteBtn = document.querySelector("#invite-btn");
let imHost = false
let startGameButton
let canStartMatch = false
let settings = {}
const settingsElements = {
  allowSpectators: document.querySelector("#allow-spectators"),
  pointLimit:      document.querySelector("#point-limit"),
  handLosesDouble: document.querySelector("#hand-loses-double"),
  allowRedeal:     document.querySelector("#redeal"),
  playersLimit:    document.querySelector("#players-limit"),
  hitch:           document.querySelector("#hitch"),
  roundLoser:      document.querySelector("#round-loser"),
}

const isStepper = ((element) => { return (element.classList[0] === "stepper") })

const addEventListener = ((settings) => {
  Object.entries(settingsElements).forEach(entry => {
    const [key, element] = entry
    if (isStepper(element)) { element.innerText = settings[key]
    } else { element.value = settings[key] }
  })
})


const createPlayerLi = (name => {
  const li = document.createElement("li")
  li.innerText = name
  playerList.appendChild(li)
})

const updatePlayerList = ([playerNames]) => {
  playerList.innerHTML = ""
  playerNames.forEach(name => { createPlayerLi(name) })
  
}
sock.on("updatePlayerList", updatePlayerList)

const updateBotCountFromServer = ((botCount) => {
  Object.entries(settingsElements).forEach(entry => {
    const [key, element] = entry
    if (element.classList[0] === "stepper") { element.innerText = settings[key]
    } else { element.value = settings[key] }
  })
})
sock.on("updateBotCountFromServer", updateBotCountFromServer)

const updateSettingsFromServer = ((settings) => {
  Object.entries(settingsElements).forEach(entry => {
    const [key, element] = entry
    if (element.classList[0] === "stepper") { element.innerText = settings[key]
    } else { element.value = settings[key] }
  })
  // document.querySelector("#allow-spectators").value = settings.allowSpectators
  // document.querySelector("#point-limit").innerText = settings.pointLimit
  // document.querySelector("#hand-loses-double").value = settings.handLosesDouble
  // document.querySelector("#redeal").value = settings.allowRedeal
  // document.querySelector("#players-limit").innerText = settings.playersLimit
  // document.querySelector("#hitch").value = settings.hitch
  // document.querySelector("#round-loser").value = settings.roundLoser
})
sock.on("updateSettingsFromServer", updateSettingsFromServer)

const updateSettingsFromClient = (() => {
  Object.entries(settingsElements).forEach(entry => {                             // entry = [key, value]
    const [key, element] = entry
    if (element.classList[0] === "stepper") { settings[key] = element.innerText
    } else { settings[key] = element.value }
  })


  // document.querySelector("#allow-spectators").value = settings.allowSpectators
  // document.querySelector("#point-limit").innerText = settings.pointLimit
  // document.querySelector("#hand-loses-double").value = settings.handLosesDouble
  // document.querySelector("#redeal").value = settings.allowRedeal
  // document.querySelector("#players-limit").innerText = settings.playersLimit
  // document.querySelector("#hitch").value = settings.hitch
  // document.querySelector("#round-loser").value = settings.roundLoser
})

const emitStartMatch = () => {
  if (!canStartMatch) {return}
  settings.allowSpectators = document.querySelector("#allow-spectators").value
  settings.pointLimit = document.querySelector("#point-limit").innerText
  settings.handLosesDouble = document.querySelector("#hand-loses-double").value
  settings.allowRedeal = document.querySelector("#redeal").value
  settings.playersLimit = document.querySelector("#players-limit").innerText
  settings.hitch = document.querySelector("#hitch").value
  settings.roundLoser = document.querySelector("#round-loser").value
  sock.emit("startMatch")
}

// const createAddBotButton = () => {
//   const addBotButton = document.createElement("button")
//   addBotButton.setAttribute("id", `add-bot-btn`)
//   addBotButton.innerHTML = "Add Bot"
//   inviteBtn.parentNode.insertBefore(addBotButton, inviteBtn.nextSibling)
//   inviteBtn.addEventListener("click", () => {sock.emit("addBot")})
// }

const createStartGameButton = () => {
  const button = document.createElement("button")
  button.setAttribute("id", "start-game-button")
  button.classList.add("disabled")
  button.innerText = "Needed 3-6 Players"
  settingsWrapper.appendChild(button)
  startGameButton = document.querySelector("#start-game-button")
  startGameButton.addEventListener("click", emitStartMatch)
}

const hostFunctions = (allBots) => {
  imHost = true
  document.querySelectorAll(".im-not-host").forEach(element => {
    element.classList.remove("im-not-host")
  })


  createStartGameButton()

  
  settingsModifiers.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      updateSettingsFromClient()
      sock.emit("updateSettingsFromHost", modifiersKey[index], settings[modifiersKey[index]])
    })
  })
  Object.entries(settingsElements).forEach(entry => {
    const [key, element] = entry
    value = (isStepper(element))?element.innerText:element.value
    element.addEventListener("change", () => {
      sock.emit("updateSettingsFromClient", key, value)})
  })

  areAllBots = allBots
  if (areAllBots) {
    firstBotMove = true
    document.getElementById("table").addEventListener("click", () => {
      sock.emit("nextTurn")})
    } else { firstBotMove = false }
    
}
sock.on("youAreHost", hostFunctions)

const updateMatchStart = (bool) => {
  canStartMatch = bool
  if (canStartMatch) {
    startGameButton.classList.remove("disabled")
    startGameButton.innerText = "Start Game"
  } else {
    startGameButton.classList.add("disabled")
    startGameButton.innerText = "3 to 6 players needed"
  }

}
sock.on("updateMatchStart", updateMatchStart)






document.addEventListener('DOMContentLoaded', (event) => {
  const match = new URLSearchParams(window.location.search).get('match');
  sock.emit("joinGame", match)
})




function error(error) {
  if (error === "fullRoom") {
    window.location.replace(`../index.html`);
  } else {
    sock.emit("serverConsoleLog", "Error parameter unknown")
  }
}
sock.on("error", error)


inviteBtn.href = `https://api.whatsapp.com/send?text=${window.location.href}`