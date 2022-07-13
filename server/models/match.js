const Deck = require("./deck.js")
const rules = require("./rules.js")


let decks = [0, 0]
let piles = [0, 0]
let cards = [0, 0]
let messages = [0, 0]
let winner, warPile, inWar, stop


class Match {
  constructor(p0, p1) {
    this._players = [p0, p1];
    this.turns = [false, false];
    
    this._players.forEach((player, index) => {
      player.on("turn", () => {
        this._onTurn(player,index)
      });
    });
    
    this._startGame()
    
    this._players.forEach((player, index) => {
      player.on("turn", () => {
        this._onTurn(player,index)
      });
    });
  };
  
  _sendToOnePlayer(playerIndex, msg) {
    this._players[playerIndex].emit("gameMessage", msg);
  };
  
  _sendToBothPlayers(messages) {
    this._players.forEach((player, index) => {
      player.emit("gameMessage", messages[index])
    });
  };

  _startGame() {
    const deck = new Deck()
    deck.shuffle()
    const startingHand = Math.floor(deck.numberOfCards / 2)
    decks[0] = new Deck (deck.cards.slice(0, startingHand))
    decks[1] = new Deck (deck.cards.slice(startingHand, deck.numberOfCards))
    // esta es para forzar la guerra  //////
    // p1Deck = new Deck(deck.cards.slice(0, startingHand))
    //////////////////////////////////////////
  
    piles[0] = new Deck([])
    piles[1] = new Deck([])
    let warPile = new Deck([])
    inWar = false;
    stop = false;

    this._clean()

  }


  async _nextRound() {

    let promise = new Promise((resolve, reject) => {
      setTimeout(() => resolve("done!"), 3000)
    });
  
    let result = await promise;


    this.turns = [false, false]
    console.log("this.turns")
    console.log(this.turns)
    this._winnerCollects(winner[0], winner[1])
    this._clean()

  
  }
  


  _winnerCollects(winner, loser) {
    decks[winner].join(piles[winner])
    decks[winner].join(piles[loser])
    piles[winner] = new Deck([])
    piles[loser] = new Deck([])
  }

  _onTurn(player, index) {
//    inRound = true
console.log("entra en onturn")
console.log(this.turns)
if (!this.turns[index]) {
      console.log("entra en el if")
      const card = decks[index].pop();
      cards[index]=card
      let remaining = decks[index].numberOfCards
      player.emit("flip", [card, "me", remaining])
      player.broadcast.emit("flip", [card, "opponent", remaining])
      this.turns[index] = true;
      
      if (this.turns[0] && this.turns[1]) { // (this.turns == [ true, true ]) { // no se por que esta no funciono

        piles[0].push(cards[0])
        piles[1].push(cards[1])

        winner = rules.roundWinner(cards);   // esto regresa [winner, loser] (los indices de cada jugador)
        inWar = false;
        
        if (typeof(winner[0])=="number") {

          // messages.forEach( (msg, index) => {                     // esta me gusta mas pero
          //   msg = (index===winner[0]) ? "You won!" : "You loose"  // falla por el mismo motivo 
          // })                                                      // que no secual es

          if (!!winner[0]) {
            messages = ["You loose", "You won!"]
          } else {
            messages = ["You won!", "You loose"]
          }
          this._sendToBothPlayers(messages)

          this._nextRound()

        } else {                  // hacer el caso de guerra!!
          this._sendToBothPlayers(["War!", "War!"])
        }


        
      }
    }
      
  };

  _clean() {
    console.log("ejecuta clean")
    this._players[0].emit("clean", [decks[0].numberOfCards, decks[1].numberOfCards]);
    this._players[1].emit("clean", [decks[1].numberOfCards, decks[0].numberOfCards]);
  };




};




// document.addEventListener("click", () => {
//   if (stop) {
//     startGame()
//     return
//   }

//   if (inWar) {
//     putOne()
//   } else if (inRound) {
//     cleanBeforeRound()
//   } else {
//     flipCards()
//   }
// })

// cleanBeforeRound()
// function cleanBeforeRound() {
//   inRound = false
//   p1CardSlot.innerHTML = ""
//   p0CardSlot.innerHTML = ""
//   text.innerText = ""

//   updateDeckCount()
// }

// function updateDeckCount() {
//   p0DeckElement.innerText = p0Deck.numberOfCards
//   p1DeckElement.innerText = p1Deck.numberOfCards
// }

// function flipCards() {
//   inRound = true
//   const p0Card = p0Deck.pop()
//   const p1Card = p1Deck.pop()
//   p0CardSlot.innerHTML=""
//   p1CardSlot.innerHTML=""
//   p0CardSlot.appendChild(p0Card.getHTML())
//   p1CardSlot.appendChild(p1Card.getHTML())
//   p0Pile.push(p0Card)
//   p1Pile.push(p1Card)

//   updateDeckCount()

//   if(isRoundWinner(p0Card, p1Card)) {
//     text.innerText = "Win"
//     p0Deck.join(p0Pile)
//     p0Deck.join(p1Pile)
//     p0Pile = new Deck([])
//     p1Pile = new Deck([])
//     inWar = false
//   } else if (isRoundWinner(p1Card, p0Card)) {
//     text.innerText = "Loose"
//     p1Deck.join(p0Pile)
//     p1Deck.join(p1Pile)
//     p0Pile = new Deck([])
//     p1Pile = new Deck([])
//     inWar = false
//   } else {
//     text.innerText = "War!"
//     inWar = true
//   }

//   if (isGameOver(p0Deck)) {
//     text.innerText = "You Lose!!"
//     stop = true
//   } else if (isGameOver(p1Deck)) {
//     text.innerText = "You Win!!"
//     stop = true
//   }
// }

// function putOne() {
//   const p0Card = p0Deck.pop()
//   const p1Card = p1Deck.pop()
//   p0Pile.push(p0Card)
//   p1Pile.push(p1Card)
//   p0DeckElement.innerText = p0Deck.numberOfCards
//   p1DeckElement.innerText = p1Deck.numberOfCards
//   p1CardSlot.innerHTML = `<div class="deck">${p0Pile.numberOfCards}</div>`
//   p0CardSlot.innerHTML = `<div class="deck">${p1Pile.numberOfCards}</div>`
//   text.innerText = "Put one in the pile"
//   inWar = false
//   inRound = false
// }

// function isRoundWinner(cardOne, cardTwo) {
//   return CARD_VALUE_MAP[cardOne.value] > CARD_VALUE_MAP[cardTwo.value]
// }

// function isGameOver(deck) {
//   return deck.numberOfCards === 0;
// }


module.exports = Match;