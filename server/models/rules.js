const rules = {}

rules.numbers = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12]
rules.suitOrder = ["oro", "copa", "espada", "basto"] // for frenchCards ["♠", "♣", "♥", "♦"]
rules.SUIT_NUMBER_MAP = {"oro": 0, "copa": 1, "espada": 2, "basto": 3}
rules.CARD_POWER_MAP = {"2": 2, "4": 4, "5": 5, "6": 6, "7": 7, "10": 10, "11": 11, "12": 12, "3": 13, "1": 14,}
rules.CARD_VALUE_MAP = {"2": 0, "4": 0, "5": 0, "6": 0, "7": 0, "10": 2, "11": 3, "12": 4, "3": 10, "1": 11,}

rules.simplifyCard = ((card) => {
  return {
    suit: rules.suitOrder.indexOf(card.suit),
    power: rules.CARD_POWER_MAP[card.number]
  }
})

rules.nextSuit = ((suit) => {
  let index = rules.suitOrder.indexOf(suit)
  return rules.suitOrder[(index+1)%4]
})

rules.playableCards = ((hand, trickData) => { // currentBest, suit, triumphSuit
  if (trickData.turns === 0) { 
    return rules.allPlayable(hand) }
  if (hand.hasAnyCardOf(trickData.suit)) {
    if ( trickData.currentBest.suit === trickData.suit) {
      return hand.cards.map((card) => {
        if(hand.canKillInSameSuit(trickData.currentBest)) { 
          return card.beatsInSameSuit(trickData.currentBest)
        } else { return (card.suit===trickData.suit) }
      }) 
    } else {
      return hand.cards.map((card) => { return (card.suit === trickData.suit) })}
  } else if (hand.hasAnyCardOf(trickData.triumphSuit)) {
    if (trickData.suit === trickData.currentBest.suit) {
      return hand.cards.map((card) => {
        return ( trickData.triumphSuit === card.suit )})
    } else if(hand.canKillInSameSuit(trickData.currentBest)) {
      return hand.cards.map((card) => {
        return card.beatsInSameSuit(trickData.currentBest)})
    } else {
      console.log("crear alerta de ME ACHICO A TRIUNFO") // "crear alerta de ME ACHICO A TRIUNFO"
      return rules.allPlayable(hand)}
  } else { return rules.allPlayable(hand) }
})

rules.allPlayable = (hand) => { 
  return hand.cards.map((card) => { return (true) 
  })}

rules.roundWinner = ((cards, trickSuit, triumphSuit) => {
  let bestCard
  let winner = 0
//  let suitPower = {"oro": 0, "copa":0, "espada":0, "basto":0,} // for frenchCards {"♠": 0, "♣":0, "♥":0, "♦":0,}

  suitPower[triumphSuit] = 2
  suitPower[trickSuit] = 1

  cards.forEach((card, index) => {
    if (!index) {
      bestCard = card
    } else {
      if (suitPower[bestCard.suit] < suitPower[card.suit]) {
        bestCard = card
        winner = index
      } else if (suitPower[bestCard.suit] === suitPower[card.suit]) {
        if (rules.CARD_POWER_MAP[bestCard.number] < rules.CARD_POWER_MAP[card.number] ) {
          bestCard = card
          winner = index
        }
      }
    }
  })
  return winner
});

rules.isWinning = ((card, bestCard, trickSuit, triumphSuit) => {
  let suitPower = {"oro": 0, "copa":0, "espada":0, "basto":0,} // for frenchCards {"♠": 0, "♣":0, "♥":0, "♦":0,}
  suitPower[triumphSuit] = 200
  suitPower[trickSuit] = 100

  return card.absolutePower(suitPower)>bestCard.absolutePower(suitPower)?true:false
});

rules.isThereAChant = ((bunchOfCards) => {
  const isThereAChant = { "isThere": false}
  isThereAChant.chants = { "oro": false, "copa": false, "espada": false, "basto": false }
  const elevens = { "oro": false, "copa": false, "espada": false, "basto": false }
  bunchOfCards.forEach(card => {
    if (card.number == 11) { elevens[card.suit] = true}
  })
  bunchOfCards.forEach(card => {
    if (card.number == 12 && elevens[card.suit]) {
      isThereAChant.chants[card.suit] = true
      isThereAChant.isThere = true
    }
  })
  return isThereAChant
})

module.exports = rules