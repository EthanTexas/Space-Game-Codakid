class EnemyGroup extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene);
    this.createMultiple({
      key: 'enemy',
      frame: 0,
      repeat: 99,
      setActive: false,
      setVisible: false,
    });
  }
}

function move(enemy, scene) {
  enemy.setActive(true);
  enemy.setVisible(true);
  enemy.setX(Math.floor(Math.random() * scene.game.config.width));
  enemy.setY(0);
  const randomDirection = Math.random() < 0.5 ? -1 : 1;
  enemy.setVelocityX(Math.random() * 200 * randomDirection);
  enemy.setVelocityY(Math.random() * 200);
}

function enemyCheckOutOfBounds(enemyGroup, scene) {
  enemyGroup.getChildren().forEach(enemy => {
    if(enemy.y > scene.game.config.height || enemy.x < 0 || enemy.x > scene.game.config.width){
      move(enemy,scene);
    }
  });
}
