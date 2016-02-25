var game = new Phaser.Game(1024, 768, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render })


var socket // Socket connection

var land

var player

var others
var lifebar
var currentSpeed = 0
var cursors


function preload () {
    game.load.image('taxi', 'assets/imgs/taxi2.png');
    game.load.image('other', 'assets/imgs/taxi2.png');
    game.load.image('earth', 'assets/imgs/scorched_earth.png');
    game.load.image('lifebar', 'assets/imgs/lifebar.png');
}


function create () {
  socket = io.connect()
  game.stage.disableVisibilityChange = true;
  game.world.setBounds(0, 0, 1024, 768);
  land = game.add.tileSprite(0, 0, 2000, 2000, 'earth'); // Définition du BG du monde
  land.fixedToCamera = true;
  var startX = game.world.centerX - Math.random()*100;
  var startY = game.world.centerY - Math.random()*100;
  player = game.add.sprite(startX, startY, 'taxi');
  player.anchor.setTo(0.5, 0.5);
  player.body.maxVelocity.setTo(400, 400);
  player.body.collideWorldBounds = true;
  player.body.bounce.setTo(1, 1);
  lifebar = game.add.sprite(startX, startY, 'lifebar');
  lifebar.anchor.setTo(0.5, 0.5);
  lifebar.width = 50;
  cursors = game.input.keyboard.createCursorKeys();
  others = [];
  game.camera.follow(player);
  game.camera.deadzone = new Phaser.Rectangle(game.width/2-250,game.height/2-150, 500, 300); 
  game.camera.focusOnXY(0, 0);
  eventChecker();
}

var eventChecker = function () {
  socket.on('connect', function(){
    socket.emit('new-player', { x: player.x, y: player.y, angle: player.angle})
  });
  socket.on('new-player', function (data){
    console.log('New player connected:', data)
    console.log(data);
    // Ajout du nouveau joueur dans l'array qui contiendra la liste des joueurs côté client
    others.push(new RemotePlayer(data.id, game, player, data.x, data.y))
  });
  // Si un client s'est deconnecté, on lance deletePlayer
  socket.on('deletePlayer', function (data){// On récupère l'id du client qui s'est déconnecté
    var removePlayer = playerById(data.id) // On le cherche dans la liste des joueurs côté client

      // Player not found
  if (!removePlayer) {
    console.log('Player not found: ', data.id)
    return
  }
    removePlayer.player.kill() // On le supprime graphiquement

    // On le supprime enfin de l'array qui contient la liste des joueurs côté client
    others.splice(others.indexOf(removePlayer), 1)
  });
  socket.on('move-player', function (data){
      var movePlayer = playerById(data.id)
        // Player not found
          if (!movePlayer) {
            console.log('Player not found: ', data.id)
            return
          }
      // On met à jour la position des autres joueurs (on récupère l'id, on boucle dans l'array, on trouve et on change x et y );
      movePlayer.player.x = data.x;
      movePlayer.player.y = data.y;
      movePlayer.player.angle = data.angle;
  });
  socket.on('lose-life', function(life){
    lifebar.width -= 0.2;
    player.body.velocity.x = 200;
    player.body.velocity.y = 200;
    player.body.angularVelocity = 200;
    if(life == 0){
      alert('perdu');
    }
  });
}


function collisionHandler(obj , obj2){
  this.parentObj.life -= 1;
  socket.emit('lose-life', { life: this.parentObj.life , id: obj2.name});
}
function update () {
  for (var i = 0; i < others.length; i++) {
    if (others[i].alive) {
      others[i].update()
     game.physics.collide(player, others[i].player, collisionHandler, null,  { this: this, parentObj : others[i] });
    }
  }


  player.body.velocity.x = 0;
  player.body.velocity.y = 0;
  player.body.angularVelocity = 0;
  if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
    {
        player.body.angularVelocity = -200;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
    {
        player.body.angularVelocity = 200;
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.UP))
    {
        game.physics.velocityFromAngle(player.angle, 300, player.body.velocity);
        console.log(game.physics.velocityFromAngle(player.angle, 300, player.body.velocity));
    }
  lifebar.x = player.x;
  lifebar.y = player.y - 50;
  land.tilePosition.x = -game.camera.x
  land.tilePosition.y = -game.camera.y

  socket.emit('move-player', { x: player.x, y: player.y, angle : player.angle})
}
function render () {

}

// Trouver un joueur par son socket id
function playerById (id) {
  for (var i = 0; i < others.length; i++) {
    if (others[i].player.name === id) {
      return others[i]
    }
  }

  return false
}
