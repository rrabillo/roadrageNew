var loadState = {

	preload : function() {
	    game.load.image('taxi', 'assets/imgs/taxi2.png');
	    game.load.image('other', 'assets/imgs/taxi2.png');
	    game.load.image('arena', 'assets/imgs/arena.png');
	    game.load.image('lifebar', 'assets/imgs/lifebar.png');
	    game.load.image('weapon', 'assets/imgs/weapon.png');
	    game.load.image('bullet', 'assets/imgs/bullet.png');
	},
	create : function(){
		game.state.start('menu');
	}

}