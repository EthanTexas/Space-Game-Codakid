// Initialize Phaser
const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 800,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

let player;
let playerSpeed = 200;
let laserGroup;
let enemyGroup;
let emitter;
let score = 0;
let scoreText;
let lives = 3;
let livesText;
let scoreMessageText;
let gameOverText;
let youWonText;
let playAgainButton;
let laserSound;
let enemyDestroyedSound;
let playerDestroyedSound;

function preload() {
  this.load.image('player', 'assets/player.png');
  this.load.image('laser', 'assets/laser.png');
  this.load.image('enemy', 'assets/enemy.png');
  this.load.image('explosion', 'assets/explosion.png', 'assets/explosion.json');
  this.load.audio('playerLaser', 'assets/sounds/laser_player.ogg');
  this.load.audio('playerDestroyed', 'assets/sounds/player_destroyed.ogg');
  this.load.audio('enemyDestroyed', 'assets/sounds/enemy_destroyed.ogg');
}

function create() {
  player = this.physics.add.sprite(300, 700, 'player');
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  laserGroup = new LaserGroup(this);
  enemyGroup = new EnemyGroup(this);

  enemyGroup.getChildren().forEach(enemy => {
    move(enemy, this);
  });

  emitter = this.add.particles(0, 0, 'explosion', {
    frame: ['red', 'yellow', 'green', 'blue', 'purple'],
    lifespan: 1000,
    speed: { min: 100, max: 100 },
    emitting: false
  });

  // Check for overlap between lasers and enemies
  this.physics.add.overlap(laserGroup, enemyGroup, (laser, enemy) => {
    laserCollision(laser, enemy, this);
  });

  // Check for overlap between player and enemies
  this.physics.add.overlap(player, enemyGroup, (player, enemy) => {
    playerEnemyCollision(player, enemy, this);
  });

  // Add score text
  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

  // Add lives text
  livesText = this.add.text(16, 48, 'Lives: 3', { fontSize: '32px', fill: '#fff' });

  // Add game over text, initially hidden
  gameOverText = this.add.text(120, 400, 'Game Over', { fontSize: '64px', fill: '#ffffff' });
  gameOverText.setVisible(false);

  // Add you won text, initially hidden
  youWonText = this.add.text(160, 340, 'You Won', { fontSize: '64px', fill: '#00ff00' });
  youWonText.setVisible(false);

  // Add score message text, initially hidden
  scoreMessageText = this.add.text(120, 350, '', { fontSize: '32px', fill: '#ffffff' });
  scoreMessageText.setVisible(false);

  // Add play again button, initially hidden
  playAgainButton = this.add.text(200, 500, 'Play Again', { fontSize: '32px', fill: '#00ff00' });
  playAgainButton.setInteractive();
  playAgainButton.setVisible(false);
  playAgainButton.on('pointerdown', () => {
    restartGame(this);
  });

  // Load sounds
  enemyDestroyedSound = this.sound.add('enemyDestroyed');
  playerDestroyedSound = this.sound.add('playerDestroyed');
  laserSound = this.sound.add('playerLaser');
}

function update() {
  const cursor = this.input.keyboard.createCursorKeys();
  if (cursor.right.isDown) {
    player.setVelocityX(playerSpeed);
  } else if (cursor.left.isDown) {
    player.setVelocityX(-playerSpeed);
  } else {
    player.setVelocityX(0);
  }

  if (cursor.space.isDown && Phaser.Input.Keyboard.JustDown(cursor.space)) {
    if (lives > 0) {
      fireLaser(laserGroup, player);
      laserSound.play();
    }
  }

  checkOutOfBounds(laserGroup, this);
  enemyCheckOutOfBounds(enemyGroup, this);
}

function laserCollision(laser, enemy, scene) {
  enemyDestroyedSound.play();
  emitter.explode(20, enemy.x, enemy.y);
  laser.setActive(false);
  laser.setVisible(false);
  laser.disableBody(true, true);

  enemy.setActive(false);
  enemy.setVisible(false);
  enemy.disableBody(true, true);

  score += 10;
  scoreText.setText('Score: ' + score);

  // Check if all enemies are destroyed
  if (enemyGroup.countActive(true) === 0) {
    // Show you won text
    youWonText.setVisible(true);

    // Show play again button
    playAgainButton.setVisible(true);

    // Hide score and lives text
    scoreText.setVisible(false);
    livesText.setVisible(false);
  }
}

function playerEnemyCollision(player, enemy, scene) {
  playerDestroyedSound.play();
  emitter.explode(40, player.x, player.y);

  // Decrease lives
  lives -= 1;
  livesText.setText('Lives: ' + lives);

  // Check if lives are zero
  if (lives <= 0) {
    // Show game over text
    gameOverText.setVisible(true);

    // Show score message text
    scoreMessageText.setText('Your score was: ' + score);
    scoreMessageText.setVisible(true);

    // Show play again button
    playAgainButton.setVisible(true);

    // Make the player inactive and invisible, and disable its body
    player.setActive(false);
    player.setVisible(false);
    player.disableBody(true, true);

    // Make all enemies inactive and invisible
    enemyGroup.getChildren().forEach(enemy => {
      enemy.setActive(false);
      enemy.setVisible(false);
      enemy.disableBody(true, true);
    });

    // Hide score and lives text
    scoreText.setVisible(false);
    livesText.setVisible(false);

    // Change background color to blue
    scene.cameras.main.setBackgroundColor('#0000ff');
  } else {
    player.setPosition(300, 700);
  }
}

function restartGame(scene) {
  score = 0;
  lives = 3;

  scoreText.setText('Score: ' + score);
  livesText.setText('Lives: ' + lives);

  player.setActive(true);
  player.setVisible(true);
  player.enableBody(true, player.x, player.y, true, true);

  enemyGroup.clear(true, true);
  enemyGroup.createMultiple({
    key: 'enemy',
    frame: 0,
    repeat: 99,
    setXY: { x: Phaser.Math.Between(50, 550), y: Phaser.Math.Between(50, 300) },
    setActive: true,
    setVisible: true,
  });

  gameOverText.setVisible(false);
  youWonText.setVisible(false);
  scoreMessageText.setVisible(false);
  playAgainButton.setVisible(false);
  scoreText.setVisible(true);
  livesText.setVisible(true);
  scene.cameras.main.setBackgroundColor('#000000');

  enemyGroup.getChildren().forEach(enemy => {
    move(enemy, scene);
  });
}

