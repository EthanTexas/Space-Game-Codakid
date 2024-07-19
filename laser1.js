class LaserGroup extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene);

    this.createMultiple({
      key: 'laser',
      frame: 20,
      repeat: 19,
      active: false,
      visible: false,
      setXY: { x: -100, y: -100 },
    });
  }
}
function fireLaser(laserGroup, player) {
  let laser = laserGroup.getFirstDead(false, player.x, player.y);
  if (laser) {
    laser.setActive(true);
    laser.setVisible(true);
    laser.enableBody();
    //laser.body.reset(player.x, player.y); // Set position to player
    laser.setVelocityY(-500); // Move upwards
  }
}

function checkOutOfBounds(laserGroup, scene) {
  laserGroup.getChildren().forEach(laser => {
    if (laser.y < 0 || laser.y > scene.game.config.height) {
      laser.setActive(false);
      laser.disableBody(true, true);
      laser.setVelocity(0);
    }
  });
}