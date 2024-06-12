class Player extends Phaser.GameObjects.Sprite {

  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    this.scene = scene;
    this.scene.add.existing(this);
    this.x = x;
    this.y = y;
  }

  changePower(power) {
    let player = this;
    let currentPower = this.power;
    let powerStatus = this.powerStatus;
    player.power = player.power + power;
    if(power > 0) {
      this.scene.sound.play("powerup");
    }
    this.scene.tweens.addCounter({
      from: currentPower,
      to: currentPower + power,
      duration: 100,
      ease: 'linear',
      onUpdate: tween => {
        const value = Math.round(tween.getValue());
        powerStatus.setText(value);
      }
    });
  }

  hangUp() {
    let player = this;
    this.scene.sound.play("freeze");
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
    let new_direction = this.direction + step;
    const animationDelay = 200;

    if(player.power <= 0) {
      this.hangUp();
      return;
    }

    if (new_direction > 3) {
      new_direction = 0;
    } else if (new_direction < 0) {
      new_direction = 3;
    }

    this.scene.sound.play("turn");

    this.scene.tweens.add({
      targets: player,
      y: player.y - 10,
      ease: "Bounce", // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: animationDelay,
      repeat: 0,
      yoyo: true,
      onComplete: function() {
        player.direction = new_direction;
        player.changePower(-1);
        console.log(player.direction);
        player.setFrame(player.direction);
        console.log("turn:", player.x, player.y, player.direction);
      }
    });
  }
  
  move() {
    let player = this;
    let new_x = this.x;
    let new_y = this.y;
    const animationDelay = 500;

    if(player.power <= 0) {
      this.hangUp();
      return;
    }
    
    //Moving UP
    if (this.direction == 0) {
      new_x = player.x;
      new_y = player.y - 32;
      //Moving RIGHT
    } else if (player.direction == 1) {
      new_x = player.x + 64;
      new_y = player.y;
      //Moving DOWN
    } else if (player.direction == 2) {
      new_x = player.x;
      new_y = player.y + 32;
      //Moving LEFT
    } else if (player.direction == 3) {
      new_x = player.x - 64;
      new_y = player.y;
    }
  
    let tile = this.scene.topLayer.getTileAtWorldXY(new_x, new_y - 32, true);
//    console.log(tile);
    if(tile && tile.index === -1) {
      this.scene.sound.play("move");
      this.scene.tweens.add({
        targets: player,
        x: new_x,
        y: new_y,
        ease: "Bounce", // 'Cubic', 'Elastic', 'Bounce', 'Back'
        duration: animationDelay,
        repeat: 0,
        yoyo: false,
        onComplete: function() {
          player.changePower(-1);
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
        duration: animationDelay,
        repeat: 0,
        yoyo: true,
        onComplete: function() {
          player.changePower(-1);
          console.log("stuck:", player.x, player.y, player.direction);
        }
      });
    }
  }

} 