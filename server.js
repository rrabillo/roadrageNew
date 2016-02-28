var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
players = []; // Array dans lequel on stockes les joueurs connectés au serveur

// Objet pour gérer les joueurs côté serveur
var Player = function (id ,startX, startY, angle, gunAngle, life, team) {
  this.id = id;
  this.x = startX;
  this.y = startY;
  this.team = team;
  this.angle = angle;
  this.gunAngle = gunAngle;
  this.life = life;

}
var bullet = function(nextfire, x, y){
  this.nextfire = nextfire;
  this.x = x;
  this.y = y;
}
app.use("/", express.static(__dirname + "/public"));
/**
 * Lancement du serveur en écoutant les connexions arrivant sur le port 3000
 */
http.listen(3000, function () {
  console.log('Server is listening on *:3000');
});

io.on('connection', function (socket) {

  // Ajout des nouveaux joueurs
  socket.on('new-player', function (data){
    client = new Player(socket.id, data.x, data.y, data.angle, data.gunAngle, 10, data.team);
    // On broadcast le nouveau joueur aux joueurs connectés
    socket.broadcast.emit('new-player', {id: socket.id, x: client.x, y: client.y, angle: client.angle, gunAngle: client.gunAngle, life: 10, team : data.team})

    // On envoi les joueurs déjà connectés (et donc présent dans l'array players), au nouveau joueur
    var i, existingPlayer
    for (i = 0; i < players.length; i++) {
      existingPlayer = players[i]
      socket.emit('new-player', {id: existingPlayer.id , x: existingPlayer.x, y: existingPlayer.y, angle:existingPlayer.angle, gunAngle:existingPlayer.gunAngle, life: existingPlayer.life, team: existingPlayer.team})
    }

    players.push(client);
  });

  //Supression des joueurs à la déconnexion
  socket.on('disconnect',function (){
    var removePlayer = playerById(socket.id)

    // à la déconnexion, delete le joueur de l'array players
    players.splice(players.indexOf(removePlayer), 1)

    // On envoit également l'id du client qui vient de se connecter à tous les autres clients, pour supprimer côté client.
    socket.broadcast.emit('deletePlayer', {id: socket.id})
  });

  // Mouvement des joueurs
  socket.on('move-player', function (data){
    // trouver le joueur qui bouge dans l'array, par son socket id
    var movePlayer = playerById(socket.id)

    // On met à jour ses attributs x et y
    movePlayer.x = data.x;
    movePlayer.y = data.y;
    movePlayer.angle = data.angle;
    movePlayer.gunAngle = data.gunAngle;
    // et on broadcast aux autres joueurs ces informations
    socket.broadcast.emit('move-player', {id: movePlayer.id, x: movePlayer.x, y: movePlayer.y, angle: movePlayer.angle, gunAngle: movePlayer.gunAngle})
  });
  socket.on('lose-life', function (){
      var touchedPlayer = playerById(socket.id)
      touchedPlayer.life -= 1;
      socket.emit('lose-life-local', touchedPlayer.life);
      socket.broadcast.emit('lose-life', {id:touchedPlayer.id, life:touchedPlayer.life});
  });
  socket.on('player-firing', function (data){
    socket.broadcast.emit('player-firing', data);
  });
  socket.on('lose-game', function(){
    var loosedPlayer = playerById(socket.id);
    socket.broadcast.emit('lose-game', loosedPlayer);
  });
  socket.on('resurrect', function(){
    var resurrectPlayer = playerById(socket.id);
    resurrectPlayer.life = 10;
    socket.broadcast.emit('resurrect', resurrectPlayer.id);
  });
});


// Fonction pour trouver un player par l'id du socket.
function playerById (id) {
  var i
  for (i = 0; i < players.length; i++) {
    if (players[i].id === id) {
      return players[i]
    }
  }

  return false
}
