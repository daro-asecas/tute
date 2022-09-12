class Bot {
  constructor(name) {
    this.name = name
    this.responseTime = 500
  }

  async emit(event, ...parameters) {
    switch (event) {
      case "yourTurn": // parameters = playableCards  (vector T o F para cada carta)
        let promise = new Promise((resolve, reject) => {setTimeout(() => resolve("done!"), this.responseTime)}); // 500 esta bien
        let result = await promise;
        let arrayOfPlayableCardsIndex = []
        parameters[0].forEach((card, index) => {
          if(card) {arrayOfPlayableCardsIndex.push(index) }})
        const indexToPlay = Math.floor(Math.random() * arrayOfPlayableCardsIndex.length)
        const cardToPlay = arrayOfPlayableCardsIndex[indexToPlay]
        this.makePlay(cardToPlay)
        break;
      default:
      }

    }

    on(event, parameters) {
      switch (event) {
        case "chantInHandMade": // parameters = cardIndex  (vector T o F para cada carta)
        break
        default:
      }
    }


}


module.exports = Bot