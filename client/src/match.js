const addClickListener = () => {
  const area = document.getElementById("game-wrapper");
  area.addEventListener("click", () => {
    sock.emit("turn");
  })
};

// const addInviteListener = () => {
//   inviteBtn.addEventListener("click", () => {
//     inviteBtn.href = `https://api.whatsapp.com/whatsapp://send?text=${window.location.href}`
// asi deberia ser el <a>    href="" data-action="share/whatsapp/share"
//     })
//   };
  
  const playerCardSlot = document.querySelector(".player-card-slot");
  const oponentCardSlot = document.querySelector(".oponent-card-slot");
  const playerDeckElement = document.querySelector(".player-deck");
  const oponentDeckElement = document.querySelector(".oponent-deck");
  const text = document.querySelector(".game-message");
  const inviteBtn = document.querySelector("#invite-btn");

const colorOf = (card => {
    return ( card.suit==="♠" || card.suit=== "♣" ) ? "black" : "red"
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
  
  const renderDeck = ((deck, remainingCards) => {
  deck.innerText = remainingCards
  if (!remainingCards) {
    deck.classList.add("empty-deck")
  } else {
    deck.classList.remove("empty-deck")
  }
})



const flip = ([card, player, remainingCards]) => {
  if (player === "me") {
    renderDeck(playerDeckElement, remainingCards)
    playerCardSlot.innerHTML = ""
    playerCardSlot.appendChild(getHTMLOf(card))
  } else {
    renderDeck(oponentDeckElement, remainingCards)
    oponentCardSlot.innerHTML = ""
    oponentCardSlot.appendChild(getHTMLOf(card))
  }
}
sock.on("flip", flip)

const put = ([player, remainingCards, pile]) => {
  if (player === "me") {
    renderDeck(playerDeckElement, remainingCards)
    playerCardSlot.innerHTML = `<div class="deck">${pile}</div>`    
  } else {
    renderDeck(oponentDeckElement, remainingCards)
    oponentCardSlot.innerHTML = `<div class="deck">${pile}</div>` 
  }
}
sock.on("put", put)

function cleanBeforeRound([playerRemainingCards, oponentRemainingCards]) {
  text.innerText = ""

  playerCardSlot.innerHTML = ""
  renderDeck(playerDeckElement, playerRemainingCards)
  
  oponentCardSlot.innerHTML = ""
  renderDeck(oponentDeckElement, oponentRemainingCards)  
}
sock.on("clean", cleanBeforeRound)

function deal() {
  playerDeckElement.classList.add("deck")
  oponentDeckElement.classList.add("deck")
}
sock.on("deal", deal)


document.addEventListener('DOMContentLoaded', (event) => {
  const match = new URLSearchParams(window.location.search).get('match');
  sock.emit("joinGame", match)
})

function matchStart () {
  addClickListener();
}
sock.on("matchStart", matchStart)


function error (error) {
  if (error==="fullRoom") {
    window.location.replace(`../index.html`);
  } else {
    sock.emit("serverConsoleLog", "Error parameter unknown")
  }
}
sock.on("error", error)

inviteBtn.href = `https://api.whatsapp.com/send?text=${window.location.href}`