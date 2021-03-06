var playState = {
	team : null,
	alive: true,
	nextFire : 0,
	fireRate : 500,
	create : function(){
		socket = io.connect()
		game.stage.disableVisibilityChange = true;
		game.world.setBounds(0,0, 2048, 1024);
		land = game.add.tileSprite(0, 0, 2048, 1024, 'arena'); // Définition du BG du monde
		land.fixedToCamera = true;
		var startX = game.world.centerX - Math.random()*100;
		var startY = game.world.centerY - Math.random()*100;
		if(this.team === 'taxi'){
			player = game.add.sprite(startX, startY, 'taxi');
		}
		else if(this.team === 'vtc'){
			player = game.add.sprite(startX, startY, 'vtc');
		}
		player.anchor.setTo(0.5, 0.5);
		player.body.maxVelocity.setTo(400, 400);
		player.body.collideWorldBounds = true;
		player.body.bounce.setTo(1, 1);

		gun = game.add.sprite(0, 0, 'weapon', 'taxi');
		gun.anchor.setTo(0.2, 0.5);
		gun.width = 45;
		gun.height = 15;
		gun.bringToTop();


		lifebar = game.add.sprite(startX, startY, 'lifebar');
		lifebar.anchor.setTo(0.5, 0.5);
		lifebar.width = 50;

		cursors = game.input.keyboard.createCursorKeys();
		others = [];
		othersBullets = [];
		bullets = game.add.group();
		bullets.createMultiple(2, 'bullet');
		bullets.setAll('anchor.x', 0.5);
		bullets.setAll('anchor.y', 0.5);
		bullets.setAll('outOfBoundsKill', true);
		game.camera.follow(player);
		game.camera.deadzone = new Phaser.Rectangle(game.width/2-250,game.height/2-150, 500, 300); 
		game.camera.focusOnXY(0, 0);
		this.eventChecker();
		explosions = game.add.group();
	    for (var i = 0; i < 10; i++)
	    {
	        var explosionAnimation = explosions.create(0, 0, 'boom', [0], false);
	        explosionAnimation.anchor.setTo(0.5, 0.5);
	        explosionAnimation.animations.add('boom');
	    }

	},
	update: function(){
		/*****************************************
		*
		*
		* Collisions entre joueurs
		*
		*
		******************************************/
		for (var i = 0; i < others.length; i++) {
			if (others[i].alive) {
		    	others[i].update()
		   		game.physics.collide(player, others[i].player);
		  	}
		}
		/*****************************************
		*
		*
		* Collisions entre balles tirées et autres joueurs
		*
		*
		******************************************/
		// Recevoir une balle
		for (var i = 0; i < othersBullets.length; i++){
			game.physics.overlap(player, othersBullets[i].model, this.loseLife, null);
		}
		// Tirer une balle sur un autre joueur
		for (var i = 0; i < others.length; i++) {
			if (others[i].alive) {
				others[i].update()
				game.physics.overlap(bullets, others[i].player, this.destroyBullet, null);
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
    	}
		lifebar.x = player.x;
		lifebar.y = player.y - 50;
		land.tilePosition.x = -game.camera.x
		land.tilePosition.y = -game.camera.y
		gun.x = player.x;
		gun.y = player.y;
		gun.rotation = game.physics.angleToPointer(gun);
		if (game.input.activePointer.isDown && this.alive){
		      this.fire();
		}
		if(this.alive){
			socket.emit('move-player', { x: player.x, y: player.y, angle : player.angle, gunAngle : gun.angle})
		}
		for(i = 0; i < othersBullets.length; i++){
		    if(othersBullets[i].model._outOfBoundsFired){
		    	othersBullets.splice(othersBullets.indexOf(othersBullets[i]), 1);
		    }
		}
	},
	eventChecker: function(){
		socket.on('connect', function(){
	    	socket.emit('new-player', { x: player.x, y: player.y, angle: player.angle, gunAngle: gun.angle, team: playState.team})
	    	console.log(playState.team);
	  	});

	  	socket.on('new-player', function (data){
		    console.log('New player connected:', data)
		    // Ajout du nouveau joueur dans l'array qui contiendra la liste des joueurs côté client
		    others.push(new RemotePlayer(data.id, game, player, data.x, data.y, data.life, data.team))
	  	});

	  	// Si un client s'est deconnecté, on lance deletePlayer
	  	socket.on('deletePlayer', function (data){// On récupère l'id du client qui s'est déconnecté
	    	var removePlayer = playState.playerById(data.id) // On le cherche dans la liste des joueurs côté client
	      	// Player not found
		  	if (!removePlayer) {
		    	console.log('Player to remove not found: ', data.id)
		    	return
		  	}
		    removePlayer.gun.destroy();
		    removePlayer.lifebar.destroy();
		    removePlayer.player.destroy(); // On le supprime graphiquement
		    // On le supprime enfin de l'array qui contient la liste des joueurs côté client
		    others.splice(others.indexOf(removePlayer), 1)
	  	});

	  	socket.on('move-player', function (data){
	    	var movePlayer = playState.playerById(data.id)
	        // Player not found
	        if (!movePlayer) {
	            console.log('Player to move not found: ', data.id)
	        	return
	        }
	     	// On met à jour la position des autres joueurs (on récupère l'id, on boucle dans l'array, on trouve et on change x et y );
			movePlayer.player.x = data.x;
			movePlayer.player.y = data.y;
			movePlayer.player.angle = data.angle;
			movePlayer.gun.angle = data.gunAngle;
		});

	  	socket.on('lose-life-local', function(data){
		    lifepercentage = 100 * data/10; // On elève la vie au joueur localement
		    lifebar.width = 50 * lifepercentage/100; // On elève la vie au joueur localement
		      if(data <= 7 && data > 3){
			    player.frame = 1;
			  }
			  if(data <= 3){
			    player.frame = 2;
			  }
		    if(data == 0){
		    	socket.emit('lose-game');
		    	posX = player.x;
		    	posY = player.y;
		    	player.kill();
		    	gun.kill();
		    	lifebar.kill();
		    	var explosionAnimation = explosions.getFirstDead();
		        explosionAnimation.reset(posX, posY);
		        explosionAnimation.play('boom', 30, false, true);
		    	playState.alive = false;
		    	
		    	retry = game.add.sprite(game.width/2 , game.height/2, 'retry');
				retry.anchor.setTo(0.5,0.5);
				retry.fixedToCamera = true;
				retry.inputEnabled = true;
				retry.events.onInputDown.add(function () {
					player.revive();
					player.frame = 0;
			    	gun.revive();
			    	lifebar.revive();
			    	lifebar.width = 50;
			    	playState.alive = true;
			    	socket.emit('resurrect');
			    	retry.destroy();
    			});
		    }
	  	});

	  	socket.on('lose-life', function(data){
	    	var touchedPlayer = playState.playerById(data.id); // Du côté des autres clients, il faut également les prévenir que le joueur perd de la vie
	    	touchedPlayer.life = data.life; // Du côté des autres clients, il faut également les prévenir que le joueur perd de la vie
	    	if(data.life == 0){
	    		posX = touchedPlayer.player.x;
	  			posY = touchedPlayer.player.y;
	  			var explosionAnimation = explosions.getFirstDead();
		        explosionAnimation.reset(posX, posY);
		        explosionAnimation.play('boom', 30, false, true);
	    	}
	  	});
	  	socket.on('lose-game', function(data){
	  		var loosedPlayer =  playState.playerById(data.id);
	  		loosedPlayer.gun.kill();
		    loosedPlayer.lifebar.kill();
		    loosedPlayer.player.kill();
	  	});
	  	socket.on('player-firing', function (data){
	   		othersBullets.push(new RemoteBullet(game, data.x, data.y, data.angle, data.rotation, data.uniqueId, data.team));
	  	});
	  	socket.on('resurrect', function (data){
	  		var resurrectPlayer = playState.playerById(data);
	  		console.log(resurrectPlayer);
	  		resurrectPlayer.life = 10;
	  		resurrectPlayer.gun.revive();
	  		resurrectPlayer.lifebar.revive();
	  		resurrectPlayer.lifebar.width = 50;
	  		resurrectPlayer.player.revive();
	  	});
	},
	loseLife : function(obj , obj2){
			obj2.destroy();
	  		for(var i= 0; i < othersBullets.length; i++){
	    		if(othersBullets[i].model.uid == obj2.uid){
	     			othersBullets.splice(othersBullets.indexOf(othersBullets[i]), 1);
	    		}
	 		}
	 		if(obj2.firedBy != playState.team){
	  			socket.emit('lose-life');
	  		}
	  		else{
	  			console.log("dont shoot your teammates !");
	  		}
	},
	destroyBullet : function (obj, obj2){
		obj2.kill();
	},
	fire : function(){
		if (game.time.now > this.nextFire && bullets.countDead() > 0){
        	this.nextFire = game.time.now + this.fireRate;
        	bullet = bullets.getFirstDead();
        	bullet.reset(gun.x, gun.y);
        	bullet.rotation = game.physics.moveToPointer(bullet, 1000);
        	bullet.uid = this.guid();
        	bullet.bullTeam = playState.team;
        	bullet.outOfBoundsKill = true;
        	socket.emit('player-firing', {x: bullet.x , y: bullet.y, angle: bullet.angle, rotation: bullet.rotation, uniqueId : bullet.uid, team: bullet.bullTeam});
    	}
	},
	// Trouver un joueur par son socket id
	playerById : function(id){
		for (var i = 0; i < others.length; i++) {
    		if (others[i].player.name === id) {
      			return others[i]
    		}
  		}
		return false
	},
	bulletById : function(id){
		for(var i = 0; i < othersBullets.length; i++){
		    if(othersBullets[i].model.uniqueId === id){
		    	return othersBullets[i];
		    }
  		}
 		return false
	},
	// Générer un id unique pour chaque balle
	guid : function(){
		return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
    	this.s4() + '-' + this.s4() + this.s4() + this.s4();
	},
	s4 : function(){
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
}