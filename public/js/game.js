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
  game.world.setBounds(0, 0, 1024, 768);
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
  /*game.camera.follow(joueur);*/
  game.camera.deadzone = new Phaser.Rectangle(game.width/2-250,game.height/2-150, 500, 300); 
  game.camera.focusOnXY(0, 0);
  eventChecker();
}

var eventChecker = function () {
  socket.on('connect', function(){
    socket.emit('new-player', { x: player.x, y: player.y })
  });
  socket.on('new-player', function (data){
    console.log('New player connected:', data.id)
    // Add new player to the remote players array
    others.push(new RemotePlayer(data.id, game, player, data.x, data.y))
  });
  // Player removed message received
  socket.on('deletePlayer', function (data){
    var removePlayer = playerById(data.id)

    // Player not found
    if (!removePlayer) {
      console.log('Player not found: ', data.id)
      return
    }

    removePlayer.player.kill()

    // Remove player from array
    others.splice(others.indexOf(removePlayer), 1)
  });
  socket.on('move-player', function (data){
      var movePlayer = playerById(data.id)

      // Player not found
      if (!movePlayer) {
        console.log('Player not found: ', data.id)
        return
      }

      // Update player position
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

  if (game.input.activePointer.isDown) {
    if (game.physics.distanceToPointer(player) >= 10) {
      currentSpeed = 300

      player.rotation = game.physics.angleToPointer(player)
    }
  }
  socket.emit('move-player', { x: player.x, y: player.y })
}
function render () {

}

// Find player by ID
function playerById (id) {
  for (var i = 0; i < others.length; i++) {
    if (others[i].player.name === id) {
      return others[i]
    }
  }

  return false
}
