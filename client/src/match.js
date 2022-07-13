const sock = io();

const addClickListener = () => {
  const area = document.getElementById("game-wrapper");
  area.addEventListener("click", () => {
    sock.emit("turn");
  })
};

let playerCardSlot = document.querySelector(".player-card-slot");
let oponentCardSlot = document.querySelector(".oponent-card-slot");
let playerDeckElement = document.querySelector(".player-deck");
let oponentDeckElement = document.querySelector(".oponent-deck");
let text = document.querySelector(".game-message");

const colorOf = (card => {
    return ( this.suit==="♠" || this.suit=== "♣" ) ? "black" : "red"
  })

  const getHTMLOf = (card => {
    const cardDiv = document.createElement("div")
    cardDiv.innerText = card.suit
    cardDiv.classList.add("card", colorOf(card))
    cardDiv.dataset.value=`${card.value}${card.suit}`
    return cardDiv
  })

const gameMessage = (msg) => {
  text.innerText = msg}
sock.on("gameMessage", gameMessage)

const flip = ([card, player, remainingCards]) => {
  if (player == "me") {
    playerCardSlot.innerHTML = ""
    playerDeckElement.innerText = remainingCards
    playerCardSlot.appendChild(getHTMLOf(card))
  } else {
    oponentCardSlot.innerHTML = ""
    oponentDeckElement.innerText = remainingCards
    oponentCardSlot.appendChild(getHTMLOf(card))
  }
}
sock.on("flip", flip)

const put = ([card, player]) => {
  if (player="me") {
    playerDeckElement.innerText = playerDeck.numberOfCards
    playerCardSlot.innerHTML = `<div class="deck">${oponentPile.numberOfCards}</div>`    
  } else {
    oponentDeckElement.innerText = oponentDeck.numberOfCards
    oponentCardSlot.innerHTML = `<div class="deck">${playerPile.numberOfCards}</div>` 
  }
}
sock.on("put", put)

function cleanBeforeRound([playerNumberOfCards, oponentNumberOfCards]) {
  console.log("clen")
  playerCardSlot.innerHTML = ""
  playerDeckElement.innerText = playerNumberOfCards
  
  oponentCardSlot.innerHTML = ""
  oponentDeckElement.innerText = oponentNumberOfCards
  
  text.innerText = ""
}
sock.on("clean", cleanBeforeRound)



addClickListener();