var game = new Phaser.Game(1024, 768, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render })


var socket // Socket connection

var land

var player

var others

var currentSpeed = 0
var cursors


function preload () {
    game.load.image('taxi', 'assets/imgs/taxi2.png');
    game.load.image('other', 'assets/imgs/taxi2.png');
    game.load.image('earth', 'assets/imgs/scorched_earth.png');
}


function create () {
  socket = io.connect()
  game.world.setBounds(0, 0, 2000, 2000);
  land = game.add.tileSprite(0, 0, 2000, 2000, 'earth'); // Définition du BG du monde
  land.fixedToCamera = true;
  var startX = game.world.centerX - Math.random()*100;
  var startY = game.world.centerY - Math.random()*100;
  player = game.add.sprite(startX, startY, 'taxi')
  player.anchor.setTo(0.5, 0.5)
  player.body.maxVelocity.setTo(400, 400)
  player.body.collideWorldBounds = true;



  cursors = game.input.keyboard.createCursorKeys();
  others = [];
  game.camera.follow(player);
  game.camera.deadzone = new Phaser.Rectangle(game.width/2-250,game.height/2-150, 500, 300); 
  game.camera.focusOnXY(0, 0);
  eventChecker();
}

var eventChecker = function () {
  socket.on('connect', function(){
    socket.emit('new-player', { x: player.x, y: player.y })
  });
  socket.on('new-player', function (data){
    console.log('New player connected:', data)
    // Ajout du nouveau joueur dans l'array qui contiendra la liste des joueurs côté client
    others.push(new RemotePlayer(data.id, game, player, data.x, data.y))
  });
  // Si un client s'est deconnecté, on lance deletePlayer
  socket.on('deletePlayer', function (data){// On récupère l'id du client qui s'est déconnecté
    var removePlayer = playerById(data.id) // On le cherche dans la liste des joueurs côté client

    removePlayer.player.kill() // On le supprime graphiquement

    // On le supprime enfin de l'array qui contient la liste des joueurs côté client
    others.splice(others.indexOf(removePlayer), 1)
  });
  socket.on('move-player', function (data){
      var movePlayer = playerById(data.id)
      // On met à jour la position des autres joueurs (on récupère l'id, on boucle dans l'array, on trouve et on change x et y );
      movePlayer.player.x = data.x
      movePlayer.player.y = data.y
  });
}



function update () {
  for (var i = 0; i < others.length; i++) {
    if (others[i].alive) {
      others[i].update()
    }
  }


  if (cursors.left.isDown) {
    player.angle -= 4
  } else if (cursors.right.isDown) {
    player.angle += 4
  }

  if (cursors.up.isDown) {
    // The speed we'll travel at
    currentSpeed = 300
  } else {
    if (currentSpeed > 0) {
      currentSpeed -= 4
    }
  }

  if (currentSpeed > 0) {
    game.physics.velocityFromRotation(player.rotation, currentSpeed, player.body.velocity)

    player.animations.play('move')
  } else {
    player.animations.play('stop')
  }

  land.tilePosition.x = -game.camera.x
  land.tilePosition.y = -game.camera.y

  socket.emit('move-player', { x: player.x, y: player.y })
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
