const Deck = require("./deck.js")
const Bot = require("./bot.js")
const rules = require("./rules.js")
const matches = require("../server.js")

let hands = []
let piles = []
let pilesForCount = []
let finalCount = []
let cards = []
let messages = []
let chants = [false, false, false, false]
let lastRoundWinner
let startingPlayer, winner, trickSuit, currentBest, triumphSuit, nextPlayer, turns

class Match {
  constructor(room, host) {
    console.log("Room created")
    this.botNum = 0
    this.room = room
    this.host = host
    this.humanPlayers = []
    this.players = []
    this.settings = {}

    this.host.emit("youAreHost", this.areAllBots)
    this.joinRoom(host)

    this.host.on("updateBotCount", (number) => { this.updateBotCount(number) })
    this.host.on("updateSettingsFromClient", (key, value) => { this.updateSettings() })
    this.host.on("changeInPlayersList", (number) => { this.changeInPlayersList() })
    this.host.on("startMatch", () => { this.startMatch() })
    // this.host.on("startMatch", this.startMatch)         // no se por que esta no funciono
    this.host.on("nextRound", () => { this.startGame() })
    // this.host.on("nextRound", this.startGame)
  }

  get numberOfPlayers() { 
    return this.players.length
  }

  get numberOfHumanPlayers() { 
    return this.humanPlayers.length
  }

  get playerNames() {
    return this.players.map((player, index) => { return player.name || `Player ${index+1}`})
  }

  get humanPlayerNames() {
    return this.humanPlayers.map((player, index) => { return player.name || `Player ${index+1}`})
  }

  get allowMatchStart() {
    console.log("botNum", this.botNum)
    console.log("this.numberOfHumanPlayers", this.numberOfHumanPlayers)
    if (this.botNum + this.numberOfHumanPlayers < 3 || this.botNum + this.numberOfHumanPlayers > 5 ) { return false
    } else { return true}
  }

  get areAllBots() {
    return (this.numberOfHumanPlayers === 1)
  }
  
  sendToOnePlayer(playerIndex, msg) {
    this.players[playerIndex].emit("gameMessage", msg);
  };
  
  sendToAllPlayers(messages) {
    this.players.forEach((player, index) => {
      player.emit("gameMessage", messages[index] || messages)
    });
  };

  sendToAllPlayersButHost(messages) {
    this.players.forEach((player, index) => {
      if(this.host != player) {
        player.emit("gameMessage", messages[index] || messages)
      }
    })
  };

  emitEventToAllPlayers(event, ...parameters) {
    this.players.forEach((player) => {
      player.emit(event, parameters)
    });
  };

  emitEventToAllPlayersButHost(event, ...parameters) {
    this.players.forEach((player, index) => {
      if (index != 0) { player.emit(event, parameters) }
    });
  };

    makeHost(sock) {
    this.host = sock
    this.host.emit("youAreHost", this.areAllBots)
    this.host.emit("message", ["You are host", "server"])
    this.host.to(this.room).emit("message", [`${this.humanPlayerNames[0]} is host now`, "server"])
  };

  updateSettingsWrapper() {
    this.host.emit("updateMatchStart", this.allowMatchStart)
    this.emitEventToAllPlayersButHost("updateBotCountFromServer", this.botNum)
    this.emitEventToAllPlayersButHost("updateSettingsFromServer", this.settings)
  }

  updateBotCount(number) {
    this.botNum = number
    console.log("UBCFS")
    this.host.emit("updateMatchStart", this.allowMatchStart)
    this.emitEventToAllPlayersButHost("updateBotCountFromServer", number)
  }


  updateSettings(key, value) {
    this.settings[key] = value
    console.log("updateSetting")
    this.emitEventToAllPlayersButHost("updateSettingsFromServer", key, value)

  }

  joinRoom(sock) {
    sock.to(this.room).emit("message", ["Someone joined", "server"])
    this.humanPlayers.push(sock)
    console.log(this.humanPlayerNames)
    this.emitEventToAllPlayers("updatePlayerList", this.humanPlayerNames)
    this.updateSettingsWrapper()
  }

  leaveRoom(sock) {
    console.log("leaves")
    console.log(this.humanPlayers.length)
    console.log(this.humanPlayerNames)
    this.humanPlayers = this.humanPlayers.filter((value=>{return value != sock}))
    console.log(this.humanPlayers.length)
    console.log(this.humanPlayerNames)
    
    if (this.numberOfHumanPlayers === 0) {
      delete matches[this.room]
      console.log("la deletea")
      console.log(matches[this.room])
    } else {
      sock.to(this.room).emit("message", ["Someone left", "server"])
      if (sock === this.host ) {
        this.makeHost(this.humanPlayers[0])
        this.emitEventToAllPlayers("updatePlayerList", this.humanPlayerNames)
      }
      this.host.emit("updateMatchStart", this.allowMatchStart)
    }
  }


  sitInRandomOrder() {
    this.players = this.humanPlayers
    for (let i=1; i<=this.botNum; i++) {
      this.players.push(new Bot(`Bot ${i}` ))
    }


    for (let i = this.players.length - 1; i > 0; i--) {
      const newIndex = Math.floor(Math.random() * (i)) + 1
      const oldValue = this.players[newIndex]
      this.players[newIndex] = this.players[i]
      this.players[i] = oldValue
    }

  }

  startMatch() {
    this.emitEventToAllPlayers("message", "Match starts", "server")

    if (this.areAllBots) {                                      // baja el tiempo de respuesta
      this.players.forEach((player) => { if( player instanceof Bot)  { player.responseTime = 1 }})
    }

    this.sitInRandomOrder()

    this.players.forEach((player, index) => {                  // listener de "turn"
      if( player instanceof Bot)  {
        player.makePlay = (cardIndex) => {
          this.onTurn(player, index, cardIndex)
        }
      } else {
        player.on("turn", (cardIndex) => {
          if (nextPlayer===index) {
            this.onTurn(player, index, cardIndex)
          }
        })
      }
    })

    startingPlayer = Math.floor(Math.random() * this.numberOfPlayers)
    triumphSuit = rules.suitOrder[3]
    
    this.startGame()
  }

  startGame() {
    // this.players = this.players      // hacer esto si habilito la opcion playerlimit
    triumphSuit = rules.nextSuit(triumphSuit)
    startingPlayer = (startingPlayer + 1) % this.numberOfPlayers
    nextPlayer = startingPlayer
    turns = 0
    const deck = new Deck()
    deck.shuffle()
    hands = deck.deal(this.numberOfPlayers)
    hands.forEach((hand) => {hand.sort(triumphSuit)})

    piles = this.players.map(function() {return new Deck([])})

    this.players.forEach((player, index) => {
      console.log(index)
      console.log(player)
      console.log(player instanceof Bot)
      player.emit("deal", index, this.numberOfPlayers, this.playerNames, hands[index], triumphSuit, startingPlayer)
    })

    this.emitYourTurn(nextPlayer, rules.allPlayable(hands[nextPlayer]))
  }

  onTurn(player, index, cardIndex) {
    nextPlayer = (nextPlayer + 1) % this.numberOfPlayers
    turns++
    cards[index] = hands[index].play(cardIndex);
    if (turns === 1) {
      trickSuit = cards[index].suit
      winner = index
      currentBest = cards[index]
    } else if (cards[index].beats(currentBest, trickSuit, triumphSuit)) {
      winner = index
      currentBest = cards[index]
    }
    player.emit("hand", hands[index])
    this.emitEventToAllPlayers("flip", index, cards[index])
    
    if (turns === this.numberOfPlayers) { this.trickResult() }
    else {
      let playableCards = rules.playableCards(hands[nextPlayer], currentBest, trickSuit, triumphSuit)
      this.emitYourTurn(nextPlayer, playableCards)
    }
  }
  
  emitYourTurn(nextPlayer, playableCards) {
    if(this.areAllBots && this.players[nextPlayer] instanceof Bot) {
      let isListenerActive = true
      this.host.on("nextTurn", () => {
          if (isListenerActive) {
            isListenerActive = false
            this.players[nextPlayer].emit("yourTurn", playableCards)
          }
        })
    } else {
      this.players[nextPlayer].emit("yourTurn", playableCards)
    }
  }

  trickResult() {
    messages = [`${this.playerNames[winner]} won`]
    this.sendToAllPlayers(messages)
    this.nextTrick()
  }

  async nextTrick() {
    let promise = new Promise((resolve, reject) => {
      setTimeout(() => resolve("done!"), 2000)
    });
    let result = await promise;
 
    turns = 0
    nextPlayer = winner
    this.winnerCollects()
    if (hands[0].numberOfCards) {
      this.emitYourTurn(nextPlayer, rules.allPlayable(hands[nextPlayer]))
      messages = cards.map(function() {return `P${winner} starts`})
      messages[winner] = "You start"
      this.sendToAllPlayers(messages)
    } else {
      lastRoundWinner = winner
      this.endRound()
    }
  }

  winnerCollects() {
    piles[winner].join(cards)
    this.emitEventToAllPlayers("winnerCollects", winner)
  }

  endRound() {
    pilesForCount = piles.map(function(pile) {return pile.onlyCardsWithValue(triumphSuit)})
    finalCount = pilesForCount.map(function(pile) {return pile.finalCount})
    this.emitEventToAllPlayers("roundResult", pilesForCount, finalCount)
  }


};


module.exports = Match;