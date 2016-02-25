/* global game */

var RemotePlayer = function (index, game, player, startX, startY) {
  var x = startX;
  var y = startY;

  this.game = game;
  this.life = 250;
  this.player = player;
  this.alive = true;
  this.player = game.add.sprite(x, y, 'other');

  this.player.anchor.setTo(0.5, 0.5);

  this.player.name = index;
  this.player.collide = false;
  this.player.body.immovable = true;
  this.player.body.collideWorldBounds = true;
  this.player.body.bounce.setTo(1, 1);
  this.player.angle = game.rnd.angle();

  this.lastPosition = { x: x, y: y }
}

RemotePlayer.prototype.update = function () {
  if (this.player.x !== this.lastPosition.x || this.player.y !== this.lastPosition.y) {
   
  } 
  else {
  }
  this.lastPosition.x = this.player.x
  this.lastPosition.y = this.player.y
}

window.RemotePlayer = RemotePlayer
