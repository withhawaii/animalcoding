class Player extends Phaser.GameObjects.Sprite {

  constructor(scene, x, y, texture, id, xGrid, yGrid, direction) {
    super(scene, x, y, texture);
    this.scene = scene;
    this.id = id;
    this.animal = texture;
    this.x = x;
    this.y = y;
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
    this.setDepth(this.yGrid);
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
    this.y = this.yGrid * 32 + 64;
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
  
  move() {
    let player = this;
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
      this.scene.sound.play('move');
      this.scene.tweens.add({
        targets: player,
        x: new_xGrid * 64 + 32,
        y: new_yGrid * 32 + 64,
        ease: 'Bounce',
        duration: 500,
        repeat: 0,
        yoyo: false,
        onComplete: function() {
          player.xGrid = new_xGrid;
          player.yGrid = new_yGrid;
          player.updateEnergy(-1);
          ui.log('move:', player.xGrid, player.yGrid, player.direction);
        }
      });
    }
    else {
      this.stuck();
    }
  }

  path_ahead() {
    let player = this;
    let new_xGrid;
    let new_yGrid;

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
    return (ground && ground.properties['move'] && !this.scene.obstacles[new_yGrid][new_xGrid].obj) 
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

    this.scene.sound.play('stuck');
    this.scene.tweens.add({
      targets: this,
      x: new_x,
      y: new_y,
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