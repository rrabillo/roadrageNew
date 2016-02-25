var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Player = require('./Player')

app.use("/", express.static(__dirname + "/public"));
players = [];


var players	// Array of connected players

/**
 * Lancement du serveur en écoutant les connexions arrivant sur le port 3000
 */
http.listen(3000, function () {
  console.log('Server is listening on *:3000');
});

io.on('connection', function (socket) {

  // Ajout des nouveaux joueurs
  socket.on('new-player', function (data){
    // Create a new player
    var newPlayer = new Player(data.x, data.y)
    newPlayer.id = this.id

    // Broadcast new player to connected socket clients
    this.broadcast.emit('new-player', {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()})

    // Send existing players to the new player
    var i, existingPlayer
    for (i = 0; i < players.length; i++) {
      existingPlayer = players[i]
      this.emit('new-player', {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()})
    }

    // Add new player to the players array
    players.push(newPlayer);
  });

  //Supression des joueurs à la déconnexion
  socket.on('disconnect',function (){
    var removePlayer = playerById(this.id)

    // Player not found
    if (!removePlayer) {
      console.log('Player not found: ' + this.id)
      return
    }

    // Remove player from players array
    players.splice(players.indexOf(removePlayer), 1)

    // Broadcast removed player to connected socket clients
    this.broadcast.emit('deletePlayer', {id: this.id})
  });

  // Mouvement des joueurs
  socket.on('move-player', function (data){
    // Find player in array
    var movePlayer = playerById(this.id)
    // Player not found
    if (!movePlayer) {
      console.log('Player not found: ' + this.id)
      return
    }

    // Update player position
    movePlayer.setX(data.x)
    movePlayer.setY(data.y)
    
    // Broadcast updated position to connected socket clients
    this.broadcast.emit('move-player', {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()})
  });
});


/* ************************************************
** GAME HELPER FUNCTIONS
************************************************ */
// Find player by ID
function playerById (id) {
  var i
  for (i = 0; i < players.length; i++) {
    if (players[i].id === id) {
      return players[i]
    }
  }

  return false
}
