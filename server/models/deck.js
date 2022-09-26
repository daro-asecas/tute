const { simplifyCard } = require("./rules.js")
const rules = require("./rules.js")

const SUITS = rules.suitOrder
const NUMBERS = rules.numbers
// const NUMBERS = ["1"]                            // esto es para que termine rapido, eliminar luego
// const NUMBERS = ["1", "1", "1", "3", "3", "3"]  // esto es para probar los simbolos de los palos españoles
// const NUMBERS = ["1", "3", "10", "11", "12"]   // esto es para probar los puntos
// const NUMBERS = ["11", "12"]                  // esto es para probar los cantos

class Deck {
  constructor(cards = freshDeck()) {
    this.cards = cards
  }

  get numberOfCards() { 
    return this.cards.length
  }

  onlyCardsWithValue(triumphSuit) {
    let result = new Deck([])
    result.cards = this.cards.filter(card => { return card.value>0 })
    result.extras = this.extras
    result.sort(triumphSuit)
    return result
  }

  get finalCount() {
    let count = this.pointsInChants
    this.cards.forEach(card => {
      count = count + card.value
    })
    return count
  }

  get pointsInChants() {
    let points = 0
    if (Object.values(this.extras).length > 0) {
      points = points + Object.values(this.extras).reduce((a, b) => a + b, 0);
    }
    return points
  }

  hasAnyCardOf(suit) {
    let has = false
    this.cards.forEach(card => {
      if (card.suit === suit) {has = true}
    })
    return has
  }

  canKillInSameSuit(currentBest) {
    let can = false
    this.cards.forEach(card => {
      if( card.suit === currentBest.suit) {
        if( card.power > currentBest.power ) { can = true }
      }
    })
    return can
  }

  pop() {
    return this.cards.shift()
  }

  play(index) {
    return this.cards.splice(index, 1)[0]
  }

  push(card) {
    this.cards.push(card)
  }

  join(pile) {
      pile.forEach(card => {
        this.cards.push(card)
      })
  }

  sort(triumphSuit) {
    let numberOfTriumphSuit = rules.suitOrder.indexOf(triumphSuit)
    function compareCard(c0,c1) {
      const a = rules.simplifyCard(c0)
      const b = rules.simplifyCard(c1)

      if ( ((4 + a.suit - numberOfTriumphSuit)%4 > (4 + b.suit - numberOfTriumphSuit)%4) ) { return 1 }
      else if ( ((4 + a.suit - numberOfTriumphSuit)%4 < (4 + b.suit - numberOfTriumphSuit)%4) ) { return -1 }
      else if (a.power < b.power) { return 1 }
      else { return -1}
    }
    let previousCards = this.cards
    this.cards.sort(compareCard)
  }

  shuffle() {
    for (let i = this.numberOfCards - 1; i >= 0; i--) {
      const newIndex = Math.floor(Math.random() * (i + 1))
      const oldValue = this.cards[newIndex]
      this.cards[newIndex] = this.cards[i]
      this.cards[i] = oldValue
    }
  }

  deal(numOfPlayers) {
    const startingHand = Math.floor(this.numberOfCards / numOfPlayers)
    let decks = []
    for(let i = 0; i<numOfPlayers; i++ ) {
      decks[i] = new Deck (this.cards.splice(0, startingHand))
    }
    return decks
  }
}

class Card {
  constructor(suit, number) {
    this.suit = suit
    this.number = number
  }

  get value() {
    return rules.CARD_VALUE_MAP[this.number]
  }

  get power() {
    return rules.CARD_POWER_MAP[this.number]
  }

  absolutePower(suitPower) {
  return rules.CARD_POWER_MAP[this.number] + suitPower[this.suit]
}

  beats(card, trickSuit, triumphSuit) {
    return rules.isWinning(this, card, trickSuit, triumphSuit)
  }

  beatsInSameSuit(card) {
    return (this.suit === card.suit && this.power > card.power)
  }
}

function freshDeck() {
  return SUITS.flatMap(suit   => {
    return NUMBERS.map(number => {
      return new Card(suit, number)
    })
  })
}

module.exports = Deck;