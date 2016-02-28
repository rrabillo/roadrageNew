var menuState = {

	create : function(){
		land = game.add.tileSprite(0, 0, 1024, 768, 'arena');
		logo =  game.add.sprite(game.width/2, game.height/3, 'logo');
		logo.anchor.setTo(0.5, 0.5);
		chooseLabel =  game.add.text(game.width/2, game.height/2, 'Choisi ton équipe !', {font: '50px Arial', fill:'#ffffff'});
		chooseLabel.anchor.setTo(0.5,0.5);
		taxi = game.add.sprite(game.width/3.5, game.height/1.5, 'taxi');
		vtc = game.add.sprite(game.width/1.5, game.height/1.5, 'vtc');
		vtc.anchor.setTo(0.5,0.5);
		taxi.anchor.setTo(0.5,0.5);
		taxi.inputEnabled = true;
		vtc.inputEnabled = true;
		taxi.events.onInputDown.add(function () {
			playState.team = 'taxi';
			game.state.start('play');
    	});
		vtc.events.onInputDown.add(function () {
			playState.team = 'vtc';
			game.state.start('play');
    	});
	}

}