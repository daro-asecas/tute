const playersSlots = []
const playersCardSlots = []
const playersChants = []
const playersPiles = []
const resultDivs = []
const resultPiles = []
const avatars = []
const counts = []
const gameButtons = {
  play: document.getElementById("btn-play"),
  autoplay: document.getElementById("btn-autoplay"),
  chants: {
    oro: document.getElementById("btn-chant-oro"),
    copa: document.getElementById("btn-chant-copa"),
    espada: document.getElementById("btn-chant-espada"),
    basto: document.getElementById("btn-chant-basto")
  }
}
let myNumber, totalPlayers, playerNames, areAllBots, firstBotMove, triumphSuit
let firstRound =  true
let botTurnListener = false
let isAutoplayActivated = false

gameButtons.autoplay.addEventListener("click", () => {
  isAutoplayActivated = !isAutoplayActivated
  if (isAutoplayActivated) {
    sock.emit("nextTurn")
    gameButtons.autoplay.classList.add("game-button-checked")
    gameButtons.play.classList.remove("game-button-active")
    document.querySelector("#game-button-container .game-button-border").classList.add("unactive")
  } else {
    gameButtons.autoplay.classList.remove("game-button-checked")
    document.querySelector("#game-button-container .game-button-border").classList.remove("unactive")
  }
})

const gameWrapper = document.querySelector("#game-wrapper");
const resultWrapper = document.querySelector("#result-wrapper");
const table = document.querySelector("#table");
const center = document.querySelector("#center");
const handElement = document.querySelector("#hand");
const gameMessageElement = document.querySelector("#game-message");
const triumphSuitSymbol = document.querySelector("#suit-symbol");

const forEachPlayer = ((fn, ...parameters) => {
  for (let i = 0; i<totalPlayers; i++) {
    fn(i, ...parameters)
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
  const playerChants = document.createElement("div")
  playerChants.setAttribute("id", `player${i}-chants-slot`)
  playerChants.classList.add("chants-slot")
  const playerPile = document.createElement("div")
  playerPile.setAttribute("id", `player${i}-pile`)
  playerPile.classList.add("pile", "empty-pile")
  playerSlot.appendChild(playerCardSlot)
  playerSlot.appendChild(playerChants)
  playerSlot.appendChild(playerPile)
  center.appendChild(playerSlot)
  playersSlots.push(document.querySelector(`#player${i}-slot`))
  playersCardSlots.push(document.querySelector(`#player${i}-card-slot`))
  playersChants.push(document.querySelector(`#player${i}-chants-slot`))
  playersPiles.push(document.querySelector(`#player${i}-pile`))
if (i != myNumber) {
    // const container = document.createElement("div")
    // container.setAttribute("id", `player${i}-avatar-container`)
    // container.classList.add("avatar-container")
    // const border = document.createElement("div")
    // border.classList.add("avatar-border")
    const avatar = document.createElement("div")
    avatar.setAttribute("id", `player${i}-avatar`)
    avatar.classList.add("avatar","game-avatar")
    avatar.innerText = `-${playerNames[i]}-`
    avatar.setAttribute("name", playerNames[i])
    // container.appendChild(border)
    // container.appendChild(avatar)
    playerSlot.appendChild(avatar)
    avatars.push(avatar)
  } else { avatars.push("") }
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

const getHTMLOf = ((card, index, containerName) => {
const cardDiv = document.createElement("div")
  cardDiv.classList.add("card")

  // cardDiv.innerText = card.suit                          // For FRENCHCARDS
  // cardDiv.classList.add("card", colorOf(card))           // For FRENCHCARDS
  
  // EXPERIMENTO CON IMAGENES PARA CADA CARTA
  // if (card.suit==="espada") {
  //   const img = document.createElement("img")
  //   img.classList.add("svg-card")
  //   img.src = `../img/${card.suit}-6.svg`
  //   cardDiv.appendChild(img)
  // } else if (card.suit==="basto"
  //         && (card.number===10
  //           || card.number===11
  //           || card.number===12
  //         )) {
  //   const img = document.createElement("img")
  //   img.classList.add("svg-card")
  //   img.src = `../img/${card.suit}-${card.number}.jpg`
  //   cardDiv.appendChild(img)
  // } else {
    cardDiv.dataset.number = `${card.number}`                 // For FRENCHARDS `${card.number}${card.suit}`
    const img = cardImg[card.suit][card.number].cloneNode(true)
    cardDiv.appendChild(img)
  // }



  if (containerName != undefined) {
    const cardSlot = document.createElement("div")
    cardSlot.classList.add(`${containerName}-card-slot`)
    cardSlot.setAttribute("id", `${containerName}-card-slot-${index}`)
    cardDiv.setAttribute("id", `${containerName}-card-${index}`)
    cardSlot.appendChild(cardDiv)
    return cardSlot
  } else {
    return cardDiv
  }
})

const renderBunchOfCards = ((bunch, containerElement, containerName) => {
  containerElement.innerHTML = ""
  bunch.cards.forEach((card, index) => {
    containerElement.insertBefore(getHTMLOf(card, index, containerName), document.getElementById(`${containerName
    }-card-slot-${index-1}`) )
    // containerElement.appendChild(getHTMLOf(card, index, containerName))
  })
})

const renderHand = ((hand) => {
  renderBunchOfCards(hand, handElement, "hand")
})
sock.on("renderHand", renderHand)

const makeCardPlayable = (index) => {
  const cardSlot = document.getElementById(`hand-card-slot-${index}`)
  cardSlot.classList.add("hand-card-slot-playable")
  const cardDiv = document.getElementById(`hand-card-${index}`)
  cardDiv.classList.add("playable")
  cardDiv.addEventListener("click", () => {
    disableAllChantButtons()
    sock.emit("turn", index)
  })
}

const makeCardNotPlayable = (index) => {
  const cardSlot = document.getElementById(`hand-card-slot-${index}`)
  cardSlot.classList.add("hand-card-slot-not-playable")
  const cardDiv = document.getElementById(`hand-card-${index}`)
  cardDiv.classList.add("not-playable")
  // const veil = document.createElement("div")
  // veil.classList.add("veil")
  // cardSlot.appendChild(veil)
}

const yourTurn = ((playableCards) => {
  playableCards.forEach((playable, index) => {
    if (playable) { makeCardPlayable(index) }
    else {makeCardNotPlayable(index)}
  })
})
sock.on("yourTurn", yourTurn)


const turnOfPlayer = ((nextPlayer) => {
  avatars.forEach((element, index) => {
    if (index != myNumber) {
      if (index === nextPlayer) { element.classList.add("next-player")
      } else { element.classList.remove("next-player") }
    }
  })
})
sock.on("turnOfPlayer", turnOfPlayer)

const renderPile = ((pile) => { // , cardsInPile) => { // para mostrar el numero de cartas
  // pile.innerText = cardsInPile
    pile.classList.remove("empty-pile")
})

const renderAllPiles = ((piles) => { // , cardsInPile) => { // para mostrar el numero de cartas
  piles.forEach((pile, index) => {
    if (pile.exists) {
      playersPiles[index].classList.remove("empty-pile")
      
      for (let i = 0; i<pile.extras; i++) {
        chant([index, "generic", false])
      }

    } else {
      playersPiles[index].classList.add("empty-pile")
    }
  })
})

const renderGame = ((piles, cards) => {
  renderAllPiles(piles)
  cards.forEach((card, index) => {
    if (card) { flip(card, index) }
  })
})
sock.on("renderGame", renderGame)


const flip = (card, player) => {
  if (firstBotMove) {
    firstBotMove = false
  } else {
    gameMessage("")
  }
  playersCardSlots[player].innerHTML = ""
  if (card) { playersCardSlots[player].appendChild(getHTMLOf(card, false)) }
}
sock.on("flip", flip)

function winnerCollects(winner) {
  //  ("")

  forEachPlayer((i)=>{
    const card = document.querySelector(`#player${i}-card-slot>.card`)
    const angle = 360* (winner - i) / totalPlayers
    const coordX = - 0 + 11 * Math.cos((90-angle)*(Math.PI / 180))
    const coordY = - 7 + 11 * Math.sin((90-angle)*(Math.PI / 180))

    let frame = 1;
    let id
    clearInterval(id);
    id = setInterval(renderFrame, 15);
    function renderFrame() {
      if (frame <= 10) {
        card.style.transform = `translate(${coordX*(frame/10)}rem, ${coordY*(frame/10)}rem) rotate(${720*(frame/10)}deg)`
        frame += 1
      } else {
        clearInterval(id)
        card.style.transform = ``
        playersCardSlots[i].innerHTML = ""
      }
    }
  })







  renderPile(playersPiles[winner])
}
sock.on("winnerCollects", winnerCollects)


function chant(playerIndex, chantSuit, isDouble) {
  const chantContainer = document.createElement("div")
  const chantCard = document.createElement("div")
  if (playersChants[playerIndex].childElementCount===0) {
    chantContainer.classList.add("chant-container-first")
    chantContainer.setAttribute("id", `player${playerIndex}-first-chant`)
  }
  chantContainer.classList.add("chant-container")
  chantCard.classList.add("chant","card")
  playersChants[playerIndex].insertBefore(chantContainer, document.getElementById(`player${playerIndex}-first-chant`))
  chantContainer.appendChild(chantCard)
  if (isDouble) {
    const chantContainer2 = document.createElement("div")
    const chantCard2 = document.createElement("div")
    chantContainer2.classList.add("chant-container")
    chantCard2.classList.add("chant","card")
    playersChants[playerIndex].insertBefore(chantContainer2, document.getElementById(`player${playerIndex}-first-chant`))
    chantContainer2.appendChild(chantCard2)
  }
}
sock.on("chant", chant)

function chantOption (chantSuit) {
  gameButtons.chants[chantSuit].classList.add("game-button-active")
}
sock.on("chantOption", chantOption)


function deal(myNum, totPlayers, names, hand, triumphSuitParameter, startingPlayer, allBots) {
  gameWrapper.classList.remove("hidden");
  settingsWrapper.classList.add("hidden");
  resultWrapper.classList.add("hidden");
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
          gameButtons.play.addEventListener("click", () => {
            gameButtons.play.classList.remove("game-button-active")
            sock.emit("nextTurn")})
          }
        } else { firstBotMove = false }
  }
  forEachPlayer((i)=>{
    playersPiles[i].classList.add("empty-pile")
    playersChants[i].innerHTML = ""
  })
  renderHand(hand)
  triumphSuit = triumphSuitParameter
  triumphSuitSymbol.src =`../img/${triumphSuit}.png`
  if (startingPlayer != myNum && firstBotMove) {
    firstBotMove = false
  }
  pointsForChant()
}
sock.on("deal", deal)


function botTurn() {
  if (isAutoplayActivated) {
    sock.emit("nextTurn")
  } else {
    gameButtons.play.classList.add("game-button-active")
    gameButtons.autoplay.classList.add("game-button-active")
  }
}
sock.on("botTurn", botTurn)

const setResultWrapper = () => {
  forEachPlayer((i) => {
    const resultDiv = document.createElement("div")
    resultDiv.setAttribute("id", `player${i}-result`)
    resultDiv.classList.add("player-result")

    const avatarAndCount = document.createElement("div")
    avatarAndCount.classList.add("avatar-and-count")
    const resultAvatar = document.createElement("div")
    resultAvatar.setAttribute("id", `player${i}-avatar-result`)
    resultAvatar.classList.add("result-avatar")
    resultAvatar.innerText = playerNames[i]
    const resultPile = document.createElement("div")
    resultPile.setAttribute("id", `player${i}-result-pile`)
    resultPile.classList.add("result-pile")
    const count = document.createElement("div")
    count.setAttribute("id", `player${i}-count`)
    count.classList.add("count")
    avatarAndCount.appendChild(resultAvatar)
    avatarAndCount.appendChild(count)
    resultDiv.appendChild(avatarAndCount)
    resultDiv.appendChild(resultPile)
    resultWrapper.appendChild(resultDiv)
    resultDivs.push(document.querySelector(`#player${i}-result`))
    resultPiles.push(document.querySelector(`#player${i}-result-pile`))
    counts.push(document.querySelector(`#player${i}-count`))
    avatars[i].innerHTML = playerNames[i]
  })
}

const fillPlayerResultDiv = ((i, pilesForCount, finalCount) => {
  counts[i].innerHTML = finalCount[i]
  renderBunchOfCards(pilesForCount[i], resultPiles[i], `result-player${i}`)
})

const nextRoundButton = (() => {
  const nextRoundBtn = document.createElement("button")
  nextRoundBtn.innerText = "Next Round"
  nextRoundBtn.setAttribute("id", "next-round-button")
  nextRoundBtn.classList.add("button")
  resultWrapper.appendChild(nextRoundBtn)
  document.getElementById("next-round-button").addEventListener("click", () => {sock.emit("nextRound")})
})

function roundResult(pilesForCount, finalCount) {
  gameWrapper.classList.add("hidden");
  resultWrapper.classList.remove("hidden");
  
  if (firstRound) {
    setResultWrapper()
    firstRound = false
    if (myNumber === 0) { nextRoundButton() }   // CORREGIR ESTO!! EL HOST NO PODRIA ABANDONAR LA SALA
  }
  forEachPlayer(fillPlayerResultDiv, pilesForCount, finalCount)
}
sock.on("roundResult", roundResult)


// Precarga de las imagenes de las cartas
const cardImg = {}
const suits = ["oro", "copa", "espada", "basto"]
suits.forEach(suit => {
  cardImg[suit] = [0] // 0 es la imagen de los cantos
  for (let i=1; i<13; i++) {
    const img = document.createElement("img")
    img.classList.add("suit-symbol")
    if (i == "1") {
      img.src = `../img/${suit}-as.png`
      img.classList.add(`${suit}-as`)
    } else {
      img.src = `../img/${suit}.png`
      if (suit==="espada"||suit==="basto") { img.classList.add("large-suit") }
    }
    cardImg[suit].push(img)
  }
})

function addChantListener (suit) {
  gameButtons.chants[suit].addEventListener("click", () => {
    disableAllChantButtons()
    sock.emit("chantInHandMade", suit)
  })
}
addChantListener("oro")
addChantListener("copa")
addChantListener("espada")
addChantListener("basto")

function pointsForChant () {
  gameButtons.chants.oro.setAttribute("points", "+20")
  gameButtons.chants.copa.setAttribute("points", "+20")
  gameButtons.chants.espada.setAttribute("points", "+20")
  gameButtons.chants.basto.setAttribute("points", "+20")
  gameButtons.chants[triumphSuit].setAttribute("points", "+40") // sobreescribe
}

function disableAllChantButtons() {
  gameButtons.chants.oro.classList.remove("game-button-active")
  gameButtons.chants.copa.classList.remove("game-button-active")
  gameButtons.chants.espada.classList.remove("game-button-active")
  gameButtons.chants.basto.classList.remove("game-button-active")
}