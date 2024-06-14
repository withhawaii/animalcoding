class Player extends Phaser.GameObjects.Sprite {

  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    this.scene = scene;
    this.scene.add.existing(this);
    this.x = x;
    this.y = y;
  }

  changeEnergy(energy) {
    let player = this;
    let currentEnergy = this.energy;
    let energyStatus = this.energyStatus;
    player.energy = player.energy + energy;
    if(energy > 0) {
      this.scene.sound.play("charged");
    }
    this.scene.tweens.addCounter({
      from: currentEnergy,
      to: currentEnergy + energy,
      duration: 1000,
      ease: 'linear',
      onUpdate: tween => {
        const value = Math.round(tween.getValue());
        energyStatus.setText(value);
      }
    });
  }

  hangUp() {
    let player = this;
    this.scene.sound.play("hangup");
    this.scene.tweens.add({
      targets: player,
      y: player.y - 10,
      ease: "Bounce", // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 100,
      repeat: 0,
      yoyo: true,
      onComplete: function() {
        player.setFrame(4);        
        console.log("hangup:", player.x, player.y, player.direction);
      }
    });
  }

  turn(step) {
    let player = this;
    //Modulo calculation to get a new direction
    let new_direction = ((this.direction + step) % 4 + 4) % 4;
    console.log("new_direction:", new_direction);

    if(player.energy <= 0) {
      this.hangUp();
      return;
    }

    this.scene.sound.play("turn");
    this.scene.tweens.add({
      targets: player,
      y: player.y - 10,
      ease: "Bounce", // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 200,
      repeat: 0,
      yoyo: true,
      onComplete: function() {
        player.direction = new_direction;
        player.setFrame(player.direction);
        player.changeEnergy(-1);
        console.log("turn:", player.x, player.y, player.direction);
      }
    });
  }
  
  move() {
    let player = this;
    let new_x = this.x;
    let new_y = this.y;

    if(player.energy <= 0) {
      this.hangUp();
      return;
    }
    
    if (this.direction == CST.UP) {
      new_x = player.x;
      new_y = player.y - 32;
    } else if (player.direction == CST.RIGHT) {
      new_x = player.x + 64;
      new_y = player.y;
    } else if (player.direction == CST.DOWN) {
      new_x = player.x;
      new_y = player.y + 32;
    } else if (player.direction == CST.LEFT) {
      new_x = player.x - 64;
      new_y = player.y;
    }
  
    let top_tile = this.scene.topLayer.getTileAtWorldXY(new_x, new_y - 32, true);
    let base_tile = this.scene.baseLayer.getTileAtWorldXY(new_x, new_y, true);
    //Move only when a solid ground exists and no top tile (obstruct items) exists
    if(base_tile && [-1, 3, 4].indexOf(base_tile.index) === -1 && top_tile && top_tile.index === -1) {
      this.scene.sound.play("move");
      this.scene.tweens.add({
        targets: player,
        x: new_x,
        y: new_y,
        ease: "Bounce", // 'Cubic', 'Elastic', 'Bounce', 'Back'
        duration: 500,
        repeat: 0,
        yoyo: false,
        onComplete: function() {
          player.changeEnergy(-1);
          console.log("move:", player.x, player.y, player.direction);
        }
      });
    }
    else {
      this.scene.sound.play("stuck");
      this.scene.tweens.add({
        targets: this,
        x: new_x,
        y: new_y,
        ease: "Bounce", // 'Cubic', 'Elastic', 'Bounce', 'Back'
        duration: 500,
        repeat: 0,
        yoyo: true,
        onComplete: function() {
          player.changeEnergy(-1);
          console.log("stuck:", player.x, player.y, player.direction);
        }
      });
    }
  }

} 