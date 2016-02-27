
var RemoteBullet = function (game,  startX, startY, angle, rotation) {
	this.x = startX;
	this.y = startY;
	this.angle = angle;
	this.model = game.add.sprite( this.x, this.y, 'bullet');
	this.model.rotation = rotation;
	this.model.outOfBoundsKill = true;
	this.model.collideWorldBounds = false;
	this.model.bringToTop();
	game.physics.velocityFromAngle(this.angle, 1000, this.model.body.velocity);
}
window.RemoteBullet = RemoteBullet;