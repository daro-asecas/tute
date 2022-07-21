const Deck = require("./deck.js")
const rules = require("./rules.js")

let decks = [0, 0]
let piles = [0, 0]
let cards = [0, 0]
let messages = [0, 0]
let winner, stop

class Match {
  constructor(room, p0, p1) {
    this._players = [p0, p1];
    this.turns = [false, false];
    this._room = room

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
      player.emit("gameMessage", messages[index] || messages)
    });
  };

  _startGame() {
    const deck = new Deck()
    deck.shuffle()
    const startingHand = Math.floor(deck.numberOfCards / 2)
    decks[0] = new Deck (deck.cards.slice(0, startingHand))
    decks[1] = new Deck (deck.cards.slice(startingHand, deck.numberOfCards))
    
    // decks[1] = decks[0]                                // esta es para forzar la guerra
    // decks[1].cards = [ { suit: '♠', value: '2' }]     //  este fuerza el game over

    piles[0] = new Deck([])
    piles[1] = new Deck([])
    stop = false;

    this._players[0].emit("deal")  // io.emit("deal")  // esta no me funciono
    this._players[1].emit("deal") //  (incluso requiriendo io al inicio)
    this._clean()
  }

  async _nextRound() {
   let promise = new Promise((resolve, reject) => {
      setTimeout(() => resolve("done!"), 2000)
    });
    let result = await promise;

    this.turns = [false, false]
    this._winnerCollects(winner[0], winner[1])
    this._clean()
    this._isGameOver(decks)
  }

  async _putOne() {

    let promise = new Promise((resolve, reject) => {
      setTimeout(() => resolve("done!"), 2000)
    });
    let result = await promise;

    this.turns = [false, false]

    if (decks[0].numberOfCards > 1 && decks[1].numberOfCards > 1) {
      this._sendToBothPlayers(["Put one"])
      this._players.forEach((player, index) => {
        piles[index].push(decks[index].pop())
        let remaining = decks[index].numberOfCards
        let pile = piles[index].numberOfCards
        player.emit("put", ["me", remaining, pile])
        player.to(this._room).emit("put", ["opponent", remaining, pile])
      })
    } else {
      this._sendToBothPlayers(["Last card, good luck!"])
    }
  }

  _winnerCollects(winner, loser) {
    decks[winner].join(piles[winner])
    decks[winner].join(piles[loser])
    piles[winner] = new Deck([])
    piles[loser] = new Deck([])
  }

  _onTurn(player, index) {
    if (stop) {return}
    if (!this.turns[index]) {
      this.turns[index] = true;
      cards[index] = decks[index].pop();
      piles[index].push(cards[index]);
      let remaining = decks[index].numberOfCards
      player.emit("flip", [cards[index], "me", remaining])
      player.to(this._room).emit("flip", [cards[index], "opponent", remaining])
      
      if (this.turns[0] && this.turns[1]) {
        this._round()
      }
    }
  }
  
  _round() {
        winner = rules.roundWinner(cards);
        if (typeof(winner[0])=="number") {

          // messages.forEach( (msg, index) => {msg = (index===winner[0]) ? "You won!" : "You loose"})
          // esta me gusta mas pero falla   

          if (!!winner[0]) { messages = ["You loose", "You won!"]
          } else { messages = ["You won!", "You loose"]}
          this._sendToBothPlayers(messages)
          
          this._nextRound()

        } else {
          if (decks[0].numberOfCards===0 || decks[1].numberOfCards===0) {
            stop = true
            this._sendToBothPlayers(["GAME OVER"])  // hardcodeado el caso del empate con  la ultima carta
          } else {
            this._sendToBothPlayers(["War!"])
            this._putOne()
          }
        } 
      }

    _clean() {
      this._players[0].emit("clean", [decks[0].numberOfCards, decks[1].numberOfCards]);
      this._players[1].emit("clean", [decks[1].numberOfCards, decks[0].numberOfCards]);
    };
    
    _isGameOver(decks) {
      winner = rules.isGameOver(decks);
      if (winner===false) {return}
      stop = true
      this._sendToBothPlayers(["GAME OVER"])
    }
};



module.exports = Match;