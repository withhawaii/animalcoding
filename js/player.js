class Player extends Phaser.GameObjects.Sprite {

  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    this.scene = scene;
    this.scene.add.existing(this);
    this.x = x;
    this.y = y;
  }

  setEnergy(newEnergy) {
    let player = this;
    let currentEnergy = this.energy;
    let energyText = this.energyText;

    if(newEnergy > currentEnergy) {
      this.scene.sound.play("charged");
    }

    player.energy = newEnergy;
    this.scene.tweens.addCounter({
      from: currentEnergy,
      to: newEnergy,
      duration: 1000,
      ease: 'linear',
      onUpdate: tween => {
        const value = Math.round(tween.getValue());
        energyText.setText(value);
      }
    });
  }

  setScore(newScore) {
    let player = this;
    let currentScore = this.score;
    let scoreText = this.scoreText;

    player.score = newScore;
    this.scene.tweens.addCounter({
      from: currentScore,
      to: newScore,
      duration: 1000,
      ease: 'linear',
      onUpdate: tween => {
        const value = Math.round(tween.getValue());
        scoreText.setText(`Score: ${value}`);
      }
    });
  }

  startIdle() {
    let player = this;
    this.idle_tween = this.scene.tweens.add({
      targets: player,
      y: player.y - 5,
      ease: "Bounce", // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 100,
      repeat: -1,
      yoyo: true,
      onComplete: function() {
      }
    }).setTimeScale(0.3);
  }

  stopIdle() {
    this.idle_tween.destroy();
    this.y = this.yGrid * 32 + 64;
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
        player.setEnergy(player.energy - 1);
        console.log("turn:", player.x, player.y, player.direction);
      }
    });
  }
  
  move() {
    let player = this;
    let new_x = this.x;
    let new_y = this.y;
    let new_xGrid;
    let new_yGrid;

    if(player.energy <= 0) {
      this.hangUp();
      return;
    }

    if (player.direction == CST.UP) {
      new_xGrid = player.xGrid;
      new_yGrid = player.yGrid - 1;
    } else if (player.direction == CST.RIGHT) {
      new_xGrid = player.xGrid + 1;
      new_yGrid = player.yGrid;
    } else if (player.direction == CST.DOWN) {
      new_xGrid = player.xGrid;
      new_yGrid = player.yGrid + 1;
    } else if (player.direction == CST.LEFT) {
      new_xGrid = player.xGrid - 1;
      new_yGrid = player.yGrid;
    }
    
    //Move only when a solid ground exists and no obstruct on the way
    let ground = this.scene.ground.getTileAt(new_xGrid, new_yGrid, true);
    if(ground && ground.properties['move'] && !this.scene.obstacles[new_yGrid][new_xGrid].obj) {
      player.setDepth(new_yGrid);
      this.scene.sound.play("move");
      this.scene.tweens.add({
        targets: player,
        x: new_xGrid * 64 + 32,
        y: new_yGrid * 32 + 64,
        ease: "Bounce", // 'Cubic', 'Elastic', 'Bounce', 'Back'
        duration: 500,
        repeat: 0,
        yoyo: false,
        onComplete: function() {
          player.xGrid = new_xGrid;
          player.yGrid = new_yGrid;
          player.setEnergy(player.energy - 1);
          console.log("move:", player.xGrid, player.yGrid, player.direction);
        }
      });
    }
    else {
      this.stuck();
    }
  }

  stuck() {
    let player = this;
    let new_x;
    let new_y;

    if (player.direction == CST.UP) {
      new_x = player.x;
      new_y = player.y - 32/4;
    } else if (player.direction == CST.RIGHT) {
      new_x = player.x + 64/4;
      new_y = player.y;
    } else if (player.direction == CST.DOWN) {
      new_x = player.x;
      new_y = player.y + 32/4;
    } else if (player.direction == CST.LEFT) {
      new_x = player.x - 64/4;
      new_y = player.y;
    }

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
        player.setEnergy(player.energy - 1);
        console.log("stuck:", player.x, player.y, player.direction);
      }
    });
  }

  pickUp() {
    let player = this;

    if(player.energy <= 0) {
      this.hangUp();
      return;
    }

    let item = this.scene.items[player.yGrid][player.xGrid].obj;
    if(item) {
      console.log("Got item:", item);
      item.setVisible(false); 
      this.scene.sound.play("pickup");
      this.setScore(player.score + 10);
    }
    else {
      this.hangUp();      
    }
  }
} 