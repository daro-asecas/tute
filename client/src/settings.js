// const avatars = []   //  tal vez, si lo activo revisar en la fn setResultWrapper
// let myNumber, totalPlayers, playerNames, areAllBots

const settingsWrapper = document.querySelector("#settings-wrapper");
const playerList = document.querySelector("#players-list")
const botCount = document.querySelector("#bot-count")
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

const updateBotCountFromServer = ((numberOfBots) => {
  botCount.innerText = numberOfBots
})
sock.on("updateBotCountFromServer", updateBotCountFromServer)

const updateSingleSettingFromServer = (([key, value]) => {
  switch (settingsElements[key].classList[0]) {
    case "stepper":
      settingsElements[key].innerText = value
      break;
    case "toggle":
      settingsElements[key].checked = value
      if (key === "handLosesDouble") { 
          disableRedealToggle() }
      break;
    default:
      settingsElements[key].value = value
      break;
  }


})
sock.on("updateSingleSettingFromServer", updateSingleSettingFromServer)

const updateAllSettingsFromServer = (([settingsFromServer]) => {
  settings = settingsFromServer
  Object.entries(settingsElements).forEach(entry => {
    const [key, element] = entry
    updateSingleSettingFromServer([key, settings[key]])
  })
})
sock.on("updateAllSettingsFromServer", updateAllSettingsFromServer)

const updateSettingsFromHost = ((btn,key) => {
  switch (btn.classList[0]) {
    case "stepper-input-modifiers":
      settings[key] = settingsElements[key].innerText
      break;
      case "toggle":
        settings[key] = btn.checked
      break;
    default:
      settings[key] = btn.value
      break;  
  }
  sock.emit("updateSettingsFromHost", key, settings[key])
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

const createStartGameButton = () => {
  const button = document.createElement("button")
  button.setAttribute("id", "start-game-button")
  button.classList.add("disabled")
  button.innerText = "Start Game"
  settingsWrapper.appendChild(button)
  startGameButton = document.querySelector("#start-game-button")
  startGameButton.addEventListener("click", emitStartMatch)
}

const hostFunctions = () => {
  imHost = true
  document.querySelectorAll(".im-not-host").forEach(element => {
    element.classList.remove("im-not-host")
  })

  createStartGameButton()
  
  settingsModifiers.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      updateSettingsFromHost(btn, modifiersKey[index])
    })
  })
}
sock.on("youAreHost", hostFunctions)

const updateMatchStartButton = (bool) => {
  canStartMatch = bool
  if (canStartMatch) {
    startGameButton.classList.remove("disabled")
    startGameButton.setAttribute("alert", "")
    // startGameButton.innerText = "Start Game"
  } else {
    startGameButton.classList.add("disabled")
    // startGameButton.innerText = "3 to 5 players needed"
    // startGameButton.alert = "3 to 5 players needed";
    startGameButton.setAttribute("alert", "3 to 5 players needed")
  }

}
sock.on("updateMatchStartButton", updateMatchStartButton)



document.addEventListener('DOMContentLoaded', (event) => {
  const match = new URLSearchParams(window.location.search).get("match");
  sock.emit("joinGame", match)
})


const error = ((error) => {
  if (error === "spectatorsNotAllowed") {
    window.location.replace(`../index.html?error=spectatorsNotAllowed`);
  } else {
    sock.emit("serverConsoleLog", "Error parameter unknown")
  }
})
sock.on("error", error)


inviteBtn.href = `https://api.whatsapp.com/send?text=${window.location.href}`