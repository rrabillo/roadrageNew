var loadState = {

	preload : function() {
	    game.load.spritesheet('taxi', 'assets/imgs/taxi.png', 57, 30, 3);
	    game.load.spritesheet('other', 'assets/imgs/taxi.png', 57, 30, 3);
	    game.load.image('arena', 'assets/imgs/arena.png');
	    game.load.image('lifebar', 'assets/imgs/lifebar.png');
	    game.load.image('weapon', 'assets/imgs/weapon.png');
	    game.load.image('bullet', 'assets/imgs/bullet.png');
	    game.load.image('logo', 'assets/imgs/logo.png');
	    game.load.image('retry', 'assets/imgs/retry.png');
	    game.load.spritesheet('vtc', 'assets/imgs/vtc.png', 57, 30, 3);
	    game.load.spritesheet('boom', 'assets/imgs/explosion.png', 64, 64, 23);
	},
	create : function(){
		game.state.start('menu');
	}

}