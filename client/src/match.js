const playersSlots = []
const playersCardSlots = []
const playersPiles = []
const resultDivs = []
const resultPiles = []
const avatars = []
const counts = []
let myNumber, totalPlayers, playerNames, areAllBots, firstBotMove
let firstRound =  true
let botTurnListener = false

const gameWrapper = document.querySelector("#game-wrapper");
const resultWrapper = document.querySelector("#result-wrapper");
const table = document.querySelector("#table");
const center = document.querySelector("#center");
const handElement = document.querySelector("#hand");
const gameMessageElement = document.querySelector("#game-message");
const triumphSuitSlot = document.querySelector("#suit-slot");

const forEachPlayer = ((fn, ...parameters) => {
  for (let i = 0; i<totalPlayers; i++) {
    fn(i, parameters)
  }
})

const gameMessage = (msg) => {gameMessageElement.innerText = msg}
sock.on("gameMessage", gameMessage)

const genericPlayerSlot = ((i) => {
  const playerSlot = document.createElement("div")
  playerSlot.setAttribute("id", `player${i}-slot`)
  playerSlot.classList.add("player-slot")
  const playerCardSlot = document.createElement("div")
  playerCardSlot.setAttribute("id", `player${i}-card-slot`)
  playerCardSlot.classList.add("card-slot")
  const playerPile = document.createElement("div")
  playerPile.setAttribute("id", `player${i}-pile`)
  playerPile.classList.add("pile", "empty-pile")
  playerSlot.appendChild(playerCardSlot)
  playerSlot.appendChild(playerPile)
  center.appendChild(playerSlot)
  playersSlots.push(document.querySelector(`#player${i}-slot`))
  playersCardSlots.push(document.querySelector(`#player${i}-card-slot`))
  playersPiles.push(document.querySelector(`#player${i}-pile`))
if (i != myNumber) {
    const avatar = document.createElement("div")
    avatar.setAttribute("id", `player${i}-avatar`)
    avatar.classList.add("avatar","game-avatar")
    avatar.innerText = playerNames[i]
    playerSlot.appendChild(avatar)
  }
})

const sitOnePlayer = (i) => {
  genericPlayerSlot(i)
  let angle = -360 * i / totalPlayers
  playersSlots[i].style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
}

const sitPlayers = (() => {
  gameMessage("")
  center.innerHTML = ""
  forEachPlayer(sitOnePlayer)

  let angle = 360 * myNumber / totalPlayers
  table.style.transform = `rotate(${angle}deg)`
  gameMessageElement.style.transform = `rotate(${-angle}deg)`
})

// const colorOf = (card => { return (card.suit === "♠" || card.suit === "♣") ? "black" : "red" })  // For FRENCHCARDS

const getHTMLOf = ((card, index) => {
  const cardSlot = document.createElement("div")
  cardSlot.classList.add("hand-card-slot")
  const cardDiv = document.createElement("div")
  cardDiv.classList.add("card")
  // cardDiv.innerText = card.suit                                                                  // For FRENCHCARDS
  const img = document.createElement("img")
  img.classList.add("suit-symbol")
  if (card.number == "1") {
    img.src = `../img/${card.suit}-as.png`
    img.classList.add(`${card.suit}-as`)
} else {
    img.src = `../img/${card.suit}.png`
    if (card.suit==="espada"||card.suit==="basto") { img.classList.add("large-suit") }
  }
  // cardDiv.classList.add("card", colorOf(card))                                                   // For FRENCHCARDS
  cardDiv.dataset.number = `${card.number}`                                                         // For FRENCHARDS `${card.number}${card.suit}`
  cardDiv.appendChild(img)
  if (!(index === false)) {
    cardSlot.setAttribute("id", `hand-card-slot-${index}`)
    cardDiv.setAttribute("id", `hand-card-${index}`)
    cardSlot.appendChild(cardDiv)
    return cardSlot
  } else {
    return cardDiv
  }
})

const renderBunchOfCards = ((bunch, element) => {
  element.innerHTML = ""
  bunch.cards.forEach((card, index) => {
    element.insertBefore(getHTMLOf(card, index), document.getElementById(`hand-card-slot-${index-1}`) )
    // element.appendChild(getHTMLOf(card, index))
  })
})

const renderHand = ((hand) => {
  renderBunchOfCards(hand, handElement)
})
sock.on("hand", renderHand)

const makeCardPlayable = (index) => {
  const cardSlot = document.getElementById(`hand-card-slot-${index}`)
  cardSlot.classList.add("hand-card-slot-playable")
  const cardDiv = document.getElementById(`hand-card-${index}`)
  cardDiv.classList.add("playable")
  cardDiv.addEventListener("click", () => { sock.emit("turn", index) })
}

const makeCardNotPlayable = (index) => {
  const cardSlot = document.getElementById(`hand-card-slot-${index}`)
  cardSlot.classList.add("hand-card-slot-not-playable")
  const cardDiv = document.getElementById(`hand-card-${index}`)
  cardDiv.classList.add("not-playable")
  const veil = document.createElement("div")
  veil.classList.add("veil")
  cardSlot.appendChild(veil)
}

const yourTurn = ((playableCards) => {
  gameMessage("Your Turn")
    playableCards.forEach((playable, index) => {
      if (playable) { makeCardPlayable(index) }
      else {makeCardNotPlayable(index)}
    })
})
sock.on("yourTurn", yourTurn)

const renderPile = ((pile) => { // , cardsInPile) => { // para mostrar el numero de cartas
  // pile.innerText = cardsInPile
    pile.classList.remove("empty-pile")
})

const flip = ([player, card]) => {
  if (firstBotMove) {
    gameMessage(`All oponents are bots. Click to make them play`)
    firstBotMove = false
  } else {
    gameMessage("")
  }
  playersCardSlots[player].innerHTML = ""
  playersCardSlots[player].appendChild(getHTMLOf(card, false))
}
sock.on("flip", flip)

function winnerCollects(winner) {
  gameMessage("")
  forEachPlayer((i)=>{playersCardSlots[i].innerHTML = ""})
  renderPile(playersPiles[winner])
}
sock.on("winnerCollects", winnerCollects)

function deal(myNum, totPlayers, names, hand, triumphSuit, startingPlayer, allBots) {
  gameWrapper.style.display = "flex";
  settingsWrapper.style.display = "none";
  resultWrapper.style.display = "none";
  myNumber = myNum
  totalPlayers = totPlayers
  playerNames = names
  areAllBots = allBots
  if (firstRound) {
    sitPlayers()
    if (areAllBots) {
        firstBotMove = true
        if (imHost && !botTurnListener) {
          botTurnListener = true
          document.getElementById("table").addEventListener("click", () => {
            sock.emit("nextTurn")})
          }
        } else { firstBotMove = false }
  }
  forEachPlayer((i)=>{playersPiles[i].classList.add("empty-pile")})
  renderBunchOfCards(hand, handElement)
  triumphSuitSlot.innerText = triumphSuit
  if (startingPlayer != myNum && firstBotMove) {
    gameMessage(`You are against bots. Click to make them play`)
    firstBotMove = false
  }
}
sock.on("deal", deal)

const setResultWrapper = () => {
  forEachPlayer((i) => {
    const resultDiv = document.createElement("div")
    resultDiv.setAttribute("id", `player${i}-result`)
    resultDiv.classList.add("player-result")
    const avatar = document.createElement("div")
    avatar.setAttribute("id", `player${i}-avatar-result`)
    avatar.classList.add("avatar")
    const resultPile = document.createElement("div")
    resultPile.setAttribute("id", `player${i}-result-pile`)
    resultPile.classList.add("result-pile")
    const count = document.createElement("div")
    count.setAttribute("id", `player${i}-count`)
    count.classList.add("count")
    resultDiv.appendChild(avatar)
    resultDiv.appendChild(resultPile)
    resultDiv.appendChild(count)
    resultWrapper.appendChild(resultDiv)
    resultDivs.push(document.querySelector(`#player${i}-result`))
    avatars.push(document.querySelector(`#player${i}-avatar-result`))
    resultPiles.push(document.querySelector(`#player${i}-result-pile`))
    counts.push(document.querySelector(`#player${i}-count`))
    avatars[i].innerHTML = playerNames[i]
  })
}

const fillPlayerResultDiv = ((i, [pilesForCount, finalCount]) => {
  counts[i].innerHTML = finalCount[i]
  renderBunchOfCards(pilesForCount[i], resultPiles[i])
})

const nextRoundButton = (() => {
  const nextRoundBtn = document.createElement("button")
  nextRoundBtn.innerText = "Next Round"
  nextRoundBtn.setAttribute("id", "next-round-button")
  nextRoundBtn.classList.add("button")
  resultWrapper.appendChild(nextRoundBtn)
  document.getElementById("next-round-button").addEventListener("click", () => {sock.emit("nextRound")})
})

function roundResult([pilesForCount, finalCount]) {
  gameWrapper.style.display = "none";
  resultWrapper.style.display = "flex";
  
  if (firstRound) {
    setResultWrapper()
    firstRound = false
    if (myNumber === 0) { nextRoundButton() }   // CORREGIR ESTO!! EL HOST NO PODRIA ABANDONAR LA SALA
  }
  forEachPlayer(fillPlayerResultDiv, pilesForCount, finalCount)
}
sock.on("roundResult", roundResult)