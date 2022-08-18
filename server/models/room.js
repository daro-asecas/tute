class Room {
  constructor(id, host) {
    this.id = id
    this.host = host
    this.numClients = 0
    this.players = []
    this.spectators = []
    this.isMatchStarted = false
  }

  onConnection(sock) {
    this.players.push(sock)
  }

  onDisconnect(sock) {
    this.players.filter(function(value) { return value != sock })
    this.players.length

  }

  get numberOfClients() { return this.players.length }


}



module.exports = Room;