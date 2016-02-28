var game = new Phaser.Game(1024, 768, Phaser.AUTO, '')
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('play', playState);
game.state.start('load');




