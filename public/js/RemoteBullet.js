
var RemoteBullet = function (uid, index, game, player, startX, startY) {
	this.shooter = index;
	this.x = startX;
	this.y = startY;
	this.model = game.add.sprite( this.x, this.y, 'bullet');
	this.model.uid = uid;
	this.model.collideWorldBounds = false;
	this.model.bringToTop();
}
window.RemoteBullet = RemoteBullet;