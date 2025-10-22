class Player extends Phaser.GameObjects.Sprite {

  constructor(scene, x, y, texture, id, xGrid, yGrid, direction) {
    super(scene, x, y, texture);
    this.scene = scene;
    this.id = id;
    this.animal = texture;
    this.x = x;
    this.y = y;
    this.xGridSpawn = xGrid;
    this.yGridSpawn = yGrid;
    this.xGrid = xGrid;
    this.yGrid = yGrid;
    this.direction = direction;  
    this.energy = 0;
    this.coin = 0;
    this.ruby = 0;
    this.crystal = 0;
    this.error = 0;
    this.code = "";
    this.setFrame(this.direction);
    this.setDepth(this.yGrid + 1);
    this.scene.add.existing(this);
  }

  updateEnergy(value) {
    let player = this;
    if(value > 0) {
      this.scene.sound.play('charged');
    }
    player.energy = player.energy + value;
    player.toolbar.setEnergy(player.energy);
  }

  updateItem(item_index, value) {
    let player = this;
    if(item_index == 30) {
      player.coin = player.coin + value;
      player.toolbar.coinText.setText(player.coin);
    }
    else if(item_index == 32) {
      player.ruby = player.ruby + value;
      player.toolbar.rubyText.setText(player.ruby);
    }
    else if(item_index == 31) {
      player.crystal = player.crystal + value;
      player.toolbar.crystalText.setText(player.crystal);
    }
  }

  score() {
    let score = this.coin * CST.COIN_POINT + this.ruby * CST.RUBY_POINT + this.crystal * CST.CRYSTAL_POINT;
    return score;
  }

  bounce(height = 10, duration = 350) {
    let player = this;
    this.scene.tweens.add({
      targets: player,
      y: player.y - height,
      ease: 'Quad.easeOut',
      duration: duration,
      repeat: -1,
      yoyo: true,
      onComplete: function() {
      }
    });
  }

  reposition() {
    this.scene.tweens.killTweensOf(this);
    this.x = this.xGrid * 64 + 32;
    this.y = this.yGrid * 32 + 64;
  }

  gridAhead() {
    let player = this;
    let newGrid = {}

    if (player.direction == CST.UP) {
      newGrid.x = player.xGrid;
      newGrid.y = player.yGrid - 1;
    } else if (player.direction == CST.RIGHT) {
      newGrid.x = player.xGrid + 1;
      newGrid.y = player.yGrid;
    } else if (player.direction == CST.DOWN) {
      newGrid.x = player.xGrid;
      newGrid.y = player.yGrid + 1;
    } else if (player.direction == CST.LEFT) {
      newGrid.x = player.xGrid - 1;
      newGrid.y = player.yGrid;
    }

    return newGrid;
  }

  pathAhead() {
    let player = this;
    let newGrid = player.gridAhead();

    //Move only when a solid ground exists and no obstruct on the way
    let ground = this.scene.ground.getTileAt(newGrid.x, newGrid.y, true);
//    console.log("pathAhead:", this.scene.obstacles[newGrid.y][newGrid.x].index);
    return (ground && ground.properties['move'] && (this.scene.obstacles[newGrid.y][newGrid.x].index == -1 || this.scene.obstacles[newGrid.y][newGrid.x].index == 18))
  }

  trapAhead() {
    let player = this;
    let newGrid = player.gridAhead();
    console.log("trap", newGrid,this.scene.obstacles[newGrid.y][newGrid.x]);
    return (this.scene.obstacles[newGrid.y][newGrid.x].index == 18 && this.scene.obstacles[newGrid.y][newGrid.x].obj.frame.name == CST.TRAP_ON) 
  }

  move() {
    let player = this;
    let newGrid = player.gridAhead();
    let trapped = player.trapAhead();

    if(player.energy <= 0) {
      this.hangUp();
      return;
    }

    if(player.pathAhead()) {
      this.scene.sound.play('move');
      this.scene.tweens.add({
        targets: player,
        x: newGrid.x * 64 + 32,
        y: newGrid.y * 32 + 64,
        ease: 'Bounce',
        duration: 500,
        repeat: 0,
        yoyo: false,
        onComplete: function() {
          if(trapped) {
            player.setFrame(CST.FALL);        
            player.scene.sound.play('hangup');
            player.updateEnergy(-1 * player.energy);
            player.reposition();
            ui.log('trapped:', player.xGrid, player.yGrid, player.direction);
          }
          else {
            player.xGrid = newGrid.x;
            player.yGrid = newGrid.y;
            player.setDepth(newGrid.y + 1);
            player.updateEnergy(-1);
            ui.log('moved:', player.xGrid, player.yGrid, player.direction);
          }  
        }
      });
    }
    else {
      this.scene.sound.play('stuck');
      this.scene.tweens.add({
        targets: this,
        x: newGrid.x * 64 + 32,
        y: newGrid.y * 32 + 64,
        ease: 'Bounce',
        duration: 500,
        repeat: 0,
        yoyo: true,
        onComplete: function() {
          player.updateEnergy(- 1);
          ui.log('stuck:', player.x, player.y, player.direction);
        }
      });
    }
  }

  stopTrap() {
    let player = this;
    let newGrid = player.gridAhead();
    let trap = this.scene.obstacles[newGrid.y][newGrid.x]
    ui.log("disarmTrap:", trap);

    if(player.energy <= 0) {
      player.hangUp();
      return;
    }

    if(trap.index == 18) {
      trap.timer.paused = true;
      trap.obj.setFrame(CST.TRAP_OFF);
      player.scene.sound.play('disarm');
      player.scene.time.delayedCall(3000, () => {
        trap.timer.paused = false;
      });
    }
    else {
      player.hangUp();
    }
    player.updateEnergy(- 1);
  }

  turn(step) {
    let player = this;
    //Modulo calculation to get a new direction
    let new_direction = ((this.direction + step) % 4 + 4) % 4;
    ui.log('new_direction:', new_direction);

    if(player.energy <= 0) {
      this.hangUp();
      return;
    }

    this.scene.sound.play('turn');
    this.scene.tweens.add({
      targets: player,
      y: player.y - 10,
      ease: 'Bounce',
      duration: 200,
      repeat: 0,
      yoyo: true,
      onComplete: function() {
        player.direction = new_direction;
        player.setFrame(player.direction);
        player.updateEnergy(- 1);
        ui.log('turn:', player.x, player.y, player.direction);
      }
    });
  }

  hangUp(duration = 100) {
    let player = this;
    this.scene.sound.play('hangup');
    this.scene.tweens.add({
      targets: player,
      y: player.y - 10,
      ease: 'Bounce',
      duration: duration,
      repeat: 0,
      yoyo: true,
      onComplete: function() {
        player.setFrame(CST.FALL);        
        ui.log('hangup:', player.x, player.y, player.direction);
        player.scene.time.delayedCall(1000, () => {
           player.setFrame(player.direction);
        });
      }
    });
  }

  pickUp() {
    let player = this;

    if(player.energy <= 0) {
      this.hangUp();
      return;
    }

    let item = this.scene.items[player.yGrid][player.xGrid];
    if(item.index != -1) {
      ui.log('pick_up:', item);
      item.obj.setVisible(false); 
      this.scene.sound.play('pickup');
      player.updateEnergy(- 1);
      player.updateItem(item.index, 1);
    }
    else {
      this.hangUp();      
    }
  }

  take() {
    let player = this;

    if(player.energy <= 0) {
      this.hangUp();
      return;
    }

    let players = this.scene.players;
    for(let i = 0; i < players.length; i++) {
      if(player.xGrid == players[i].xGrid && player.yGrid == players[i].yGrid) {
        if(players[i].crystal > 0) {
          this.scene.sound.play('pickup');
          players[i].updateItem(31, -1);
          player.updateItem(31, 1);
          return;
        }
      }
    }
    this.hangUp();
  }
} 