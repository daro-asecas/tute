CARD_VALUE_MAP = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  "J": 11,
  "Q": 12,
  "K": 13,
  "A": 14,
}

const rules = {}

rules.roundWinner = ( ([c0, c1]) => {
  if (c0.value == c1.value) {
    return "false"
  } else if (CARD_VALUE_MAP[c0.value] > CARD_VALUE_MAP[c1.value]) {
    return [0, 1]
  } else {
    return [1, 0]
  }
});

rules.isGameOver = (decks) => {
  if (decks[0].numberOfCards = 0) {
    return 1
  } else if (decks[0].numberOfCards = 0) {
    return 0
  } else {
    return false
  }
}
    

module.exports = rules