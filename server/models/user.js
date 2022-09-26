class User {
  constructor(id, name) {
    this.id = id
    this.name = name
  }

  newName(name) {
    this.name = name
  }

//   onDisconnect(sock) {
//     this.players.filter(function(value) { return value != sock })
//     this.players.length

//   }

//   get numberOfClients() { return this.players.length }


}



module.exports = User;