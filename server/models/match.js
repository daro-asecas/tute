const Deck = require("./deck.js")
const Bot = require("./bot.js")
const rules = require("./rules.js")

let hands = []
let piles = []
let pilesForCount = []
let finalCount = []
let cards = []
let messages = []
const trickData = {}
let startingPlayer, winner, nextPlayer, trickNumber, playableCards


class Match {
  constructor(room, host, hostId) {
    console.log("Room created")
    this.botNum = 0
    this.room = room
    this.humanPlayers = []
    this.humanPlayersId = []
    this.players = []
    this.playerNames = []
    this.state = "settings"
    this.settings = {
      allowSpectators: true,
      pointLimit: 4,
      handLosesDouble: false,
      allowRedeal: false,
      playersLimit: 5,
      hitch: 'no',
      roundLoser: 'second'
    }
    
    this.makeHost(host)
    this.joinRoom(host, hostId)
    
  }

  get numberOfPlayers() {
    return ( this.botNum + this.humanPlayers.length )
  }

  get numberOfHumanPlayers() { 
    return this.humanPlayers.length
  }

  // get playerNames() {
  //   return this.players.map((player, index) => { return player.name || `Player ${index+1}`})
  // }

  get humanPlayerNames() {
    return this.humanPlayers.map((player, index) => { return player.name || `Player ${index+1}`})
  }

  get isAllowedMatchStart() {
    if (this.botNum + this.numberOfHumanPlayers < 3 || this.botNum + this.numberOfHumanPlayers > 5 ) { 
      return false
    } else { return true}
  }

  get areAllBots() {
    return (this.numberOfHumanPlayers === 1)
  }

  get hostIndexInHumanPlayers() {
    return (this.humanPlayers.indexOf(this.host))
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
    const playersArray = (this.isGameStarted)?this.players:this.humanPlayers
    playersArray.forEach((player, index) => {
      if(this.host != player) {
        player.emit("gameMessage", messages[index] || messages)
      }
    })
  };

  emitEventToAllPlayers(event, ...parameters) {
    const playersArray = (this.isGameStarted)?this.players:this.humanPlayers
    playersArray.forEach((player, index) => {
      player.emit(event, ...parameters)
    });
  };

  emitEventToAllPlayersButHost(event, ...parameters) {
    const playersArray = (this.isGameStarted)?this.players:this.humanPlayers
    playersArray.forEach((player, index) => {
      if (index != 0) { player.emit(event, ...parameters) }
    });
  };

    makeHost(sock) {
    this.host = sock
    this.host.emit("youAreHost", this.areAllBots)

    this.host.on("updateBotCount", (number) => { this.updateBotCountFromHost(number) })
    this.host.on("updateSettingsFromHost", (key, value) => { this.updateSettingsFromHost(key, value) })
    this.host.on("changeInPlayersList", () => { this.changeInPlayersList() })
    this.host.on("removePlayer", (index) => { this.removePlayer(index) })
    this.host.on("startGameRequest", () => { this.processStartGameRequest() })
    this.host.on("forceStartGame", () => { this.forceStartGame() })
    this.host.on("nextRound", () => { this.startGame() })
    // this.host.on("nextRound", this.startGame)           // no se por que no funcionaron asi



  };

  updateSettingsScreen() {
    this.emitEventToAllPlayers("updatePlayerList", this.humanPlayerNames, this.hostIndexInHumanPlayers)
    this.emitEventToAllPlayers("updateAllSettingsFromServer", this.settings)
    this.emitEventToAllPlayers("updateBotCountFromServer", this.botNum)
    // this.emitEventToAllPlayersButHost("updateAllSettingsFromServer", this.settings)
    // this.emitEventToAllPlayersButHost("updateBotCountFromServer", this.botNum)
    // this.host.emit("updateMatchStartButton", this.isAllowedMatchStart)
  }

  updateBotCountFromHost(number) {
    this.botNum = number
    this.emitEventToAllPlayersButHost("updateBotCountFromServer", this.botNum)
    // this.host.emit("updateMatchStartButton", this.isAllowedMatchStart)
  }

  updateSettingsFromHost(key, value) {
    this.settings[key] = value
    this.emitEventToAllPlayersButHost("updateSingleSettingFromServer", key, value)
  }

  removePlayer(index) {
    this.humanPlayers[index].emit("error", "kickedOut")

    this.humanPlayers.splice(index, 1)
    this.humanPlayersId.splice(index, 1)
    this.emitEventToAllPlayers("updatePlayerList", this.humanPlayerNames, this.hostIndexInHumanPlayers)
  }


  renderGame(sock, sockIndex) {
    this.updateSettingsScreen()

    if (this.state === "match" || this.state === "result") {
      sock.emit("deal", sockIndex, this.numberOfPlayers, this.playerNames, hands[sockIndex], trickData.triumphSuit, startingPlayer, this.areAllBots)
    
      if (this.state === "match") {
      const pilesForRender = piles.map((pile)=>{
        let pileForRender = {exists: false}
        if (pile.numberOfCards > 0) {
          pileForRender.exists = true
          pileForRender.extras = pile.pointsInChants/20
        }
        return pileForRender
      })
      sock.emit("renderGame", pilesForRender, cards)
      this.emitNextTurnData()
      } else if (this.state === "result") {
        sock.emit("roundResult", pilesForCount, finalCount)
      }
    }
  }

  reJoinRoom(sock, userId) {
    const humanPlayersIndex = this.humanPlayersId.indexOf(userId)
    const previousSock = this.humanPlayers[humanPlayersIndex]
    const playersIndex = this.players.indexOf(previousSock)

    previousSock.emit("error", "openInOtherTab")
    if(this.host===previousSock) { this.makeHost(sock) }
    
    this.humanPlayers[humanPlayersIndex] = sock
    this.players[playersIndex] = sock
    this.renderGame(sock, playersIndex)
    this.createGameListeners(sock, playersIndex)
  }

  joinRoom(sock, id) {
    sock.to(this.room).emit("message", "Someone joined", "server")
    this.humanPlayers.push(sock)
    this.humanPlayersId.push(id)
    this.updateSettingsScreen()
  }

  leaveRoom(sock) {
    this.humanPlayers = this.humanPlayers.filter((value=>{return value != sock}))
    if (this.numberOfHumanPlayers != 0) {
      sock.to(this.room).emit("message", "Someone left", "server")
      if (sock === this.host ) {
        this.makeHost(this.humanPlayers[0])
        this.host.emit("message", "You are host", "server")
        this.host.to(this.room).emit("message", [`${this.humanPlayerNames[0]} is host now`, "server"])
      }
      this.emitEventToAllPlayers("updatePlayerList", this.humanPlayerNames, this.hostIndexInHumanPlayers)
      // this.host.emit("updateMatchStartButton", this.isAllowedMatchStart)
    }
  }

  sitInRandomOrder() {
    this.players = [...this.humanPlayers]
    this.playerNames = [...this.humanPlayerNames]

    for (let i=1; i<=this.botNum; i++) {
      this.players.push(new Bot(`Bot ${i}` ))
      this.playerNames.push(`Bot ${i}`)
    }
    for (let i = this.players.length - 1; i > 0; i--) {
      const newIndex = Math.floor(Math.random() * (i)) + 1

      const oldPlayer = this.players[newIndex]
      this.players[newIndex] = this.players[i]
      this.players[i] = oldPlayer

      const oldName = this.playerNames[newIndex]
      this.playerNames[newIndex] = this.playerNames[i]
      this.playerNames[i] = oldName
    }
  }

  createGameListeners(player, index) {
    player.on("turn", (cardIndex) => {
      if (nextPlayer===index) {
        this.onTurn(player, index, cardIndex)
      }
    })
    player.on("chantInHandMade", (suit) => {
      const isThereAChant = rules.isThereAChant(hands[index].cards)
      if (isThereAChant.chants[suit] && this.chants[suit]===undefined) {
        this.emitChant(suit, index)
      }
    })
  }

  resetTrickData() {
    trickData.suit = ""
    trickData.turns = 0
    trickData.currentBest = ""
    // trickData.triumphSuit = trickData.triumphSuit // Para recordar la key
  }

  processStartGameRequest() {
    if (this.numberOfPlayers < 3) {this.host.emit("askForAddingBotsForStart", (3-this.numberOfPlayers))}
    else if (this.numberOfPlayers > 5) {this.host.emit("maxPlayerNumberExceeded")}
    else { this.startMatch() }
  }

  forceStartGame() {
    if (this.numberOfPlayers > 5) {this.host.emit("maxPlayerNumberExceeded")}
    else if (this.numberOfPlayers < 3) {
      this.botNum = this.botNum + (3-this.numberOfPlayers)
      this.emitEventToAllPlayersButHost("updateBotCountFromServer", this.botNum)
      this.startMatch()
    }
    else { this.startMatch() }
  }

  startMatch() {
      this.emitEventToAllPlayers("message", "Game starts", "server")

      if (this.areAllBots) {                                      // Baja el tiempo de respuesta. En el cliente se activa el listener del turn de los bots
        this.players.forEach((player) => { if( player instanceof Bot)  { player.responseTime = 1 }})
      }

      this.sitInRandomOrder()
      this.resetTrickData()

      this.players.forEach((player, index) => {
        if( player instanceof Bot)  {
          player.makePlay = (cardIndex) => {
            this.onTurn(player, index, cardIndex)
          }
        } else {
          this.createGameListeners(player, index)
        }
      })


      startingPlayer = Math.floor(Math.random() * this.numberOfPlayers)
      trickData.triumphSuit = rules.suitOrder[3]
      
      this.startGame()
  }
  
  get isGameStarted() {
    return ( this.state != "settings" )
  }

  startGame() {
    this.state = "match"
    trickData.triumphSuit = rules.nextSuit(trickData.triumphSuit)
    startingPlayer = (startingPlayer + 1) % this.numberOfPlayers
    nextPlayer = startingPlayer
    this.chants = {}
    this.resetTrickData()
    trickNumber = 0
    const deck = new Deck()
    deck.shuffle()
    hands = deck.deal(this.numberOfPlayers)
    hands.forEach((hand) => {hand.sort(trickData.triumphSuit)})

    cards = this.players.map(function() {})

    piles = this.players.map(function() {
      const pile = new Deck([])
      pile.extras = {}
      return pile
    })

    this.players.forEach((player, index) => {
      player.emit("deal", index, this.numberOfPlayers, this.playerNames, hands[index], trickData.triumphSuit, startingPlayer, this.areAllBots)
    })

    this.emitNextTurnData()
  }

  onTurn(player, index, cardIndex) {
    nextPlayer = (nextPlayer + 1) % this.numberOfPlayers
    trickData.turns++
    cards[index] = hands[index].play(cardIndex);
    if (trickData.turns === 1) {
      trickData.suit = cards[index].suit
      winner = index
      trickData.currentBest = cards[index]
    } else if (cards[index].beats(trickData.currentBest, trickData.suit, trickData.triumphSuit)) {
      winner = index
      trickData.currentBest = cards[index]
    }
    player.emit("renderHand", hands[index])
    this.emitEventToAllPlayers("flip", cards[index], index)
    
    if (trickData.turns === this.numberOfPlayers) { this.trickResult() }
    else {
      this.emitNextTurnData()
    }
  }

  emitChantInHand() {
    const chantsInHand = rules.isThereAChant(hands[winner].cards)
    if (chantsInHand.isThere) {
      Object.entries(chantsInHand.chants).forEach(([key, value]) => {
        if (value && this.chants[key]===undefined) {
          const chantSuit = key
          this.players[winner].emit("chantOption", chantSuit)
        }
      })
    }
  }

  emitNextTurnData() {
    const playableCards = rules.playableCards(hands[nextPlayer], trickData)
    if(this.areAllBots && this.players[nextPlayer] instanceof Bot) {
      let isListenerActive = true
      this.host.emit("activatePlayButton")
      this.host.on("nextTurn", () => {
          if (isListenerActive) {
            isListenerActive = false
            this.players[nextPlayer].emit("yourTurn", playableCards)
          }
        })
    } else {
      this.players[nextPlayer].emit("yourTurn", playableCards)

      if (trickData.turns===0 && trickNumber!=0) {
        this.emitChantInHand()        
      }
    }
    this.emitEventToAllPlayers("turnOfPlayer", nextPlayer)
  }

  trickResult() {
    let winnerName = this.playerNames[winner]
    messages = [`${winnerName} won`]
    this.sendToAllPlayers(messages)
    this.nextTrick(winnerName)
  }

  async nextTrick() {
    let promise = new Promise((resolve, reject) => {
      setTimeout(() => resolve("done!"), 2000)
    });
    let result = await promise

    
    nextPlayer = winner
    this.resetTrickData()
    this.winnerCollects()
    if (hands[0].numberOfCards) {
      this.emitNextTurnData()
    } else {
      piles[winner].extras.lastRound = 10
      this.endRound()
    }
  }

  emitChant(suit, playerIndex) {
    this.chants[suit] = playerIndex
    if (suit===trickData.triumphSuit) { piles[playerIndex].extras[suit] = 40
    } else { piles[playerIndex].extras[suit] = 20 }
    let isDouble = suit===trickData.triumphSuit
    this.emitEventToAllPlayers("chant", playerIndex, suit, isDouble)
  }


  winnerCollects() {
    const chantsInTable = rules.isThereAChant(cards)
    if (chantsInTable.isThere) {
      Object.entries(chantsInTable.chants).forEach(([key, value]) => {
        if (value) {
        this.emitChant(key, winner)
        }
      })
    }

    piles[winner].join(cards)
    cards = cards.map(()=>{})

    this.emitEventToAllPlayers("winnerCollects", winner)
  }

  endRound() {
    pilesForCount = piles.map(function(pile) {return pile.onlyCardsWithValue(trickData.triumphSuit)})
    finalCount = pilesForCount.map(function(pile) {return pile.finalCount})
    this.emitEventToAllPlayers("roundResult", pilesForCount, finalCount)
    this.state = "result"
  }


};


module.exports = Match;

// class Player {
//   constructor(id, sock) {
//     this.id = id
//     this.sock = sock
//   }

//   get isHost() {

//   }
// }