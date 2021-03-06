/* global game */

var RemotePlayer = function (index, game, player, startX, startY, life, team) {
  var x = startX;
  var y = startY;
  this.team = team;
  this.game = game;
  this.life = life;
  this.player = player;
  this.alive = true;
  if(this.team === 'taxi'){
     this.player = game.add.sprite(x, y, 'taxi');
  }
  else if(this.team === 'vtc'){
     this.player = game.add.sprite(x, y, 'vtc');
  }
  this.player.anchor.setTo(0.5, 0.5);

  this.player.name = index;
  this.player.collide = false;
  this.player.body.immovable = true;
  this.player.body.collideWorldBounds = true;
  this.player.body.bounce.setTo(1, 1);
  this.player.angle = game.rnd.angle();
  this.gun = game.add.sprite(0, 0, 'weapon', 'taxi');
  this.gun.anchor.setTo(0.2, 0.5);
  this.gun.width = 45;
  this.gun.height = 15;
  this.gun.bringToTop();
  this.lifebar = game.add.sprite(startX, startY, 'lifebar');
  this.lifebar.anchor.setTo(0.5, 0.5);
  this.lifebar.width = 50;
  this.lifebar.bringToTop();
  this.lastPosition = { x: x, y: y }
}

RemotePlayer.prototype.update = function () {
  this.lastPosition.x = this.player.x;
  this.lastPosition.y = this.player.y;
  this.gun.x = this.lastPosition.x;
  this.gun.y = this.lastPosition.y;
  this.lifebar.x = this.lastPosition.x; 
  this.lifebar.y = this.lastPosition.y -50; 
  lifepercentage = 100 * this.life/10;
  this.lifebar.width = 50 * lifepercentage/100;
  if(this.life  > 7){
    this.player.frame = 0;
  }
  if(this.life <= 7 && this.life > 3){
    this.player.frame = 1;
  }
  if(this.life <= 3){
    this.player.frame = 2;
  }
}

window.RemotePlayer = RemotePlayer
