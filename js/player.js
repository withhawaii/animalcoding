class Player extends Phaser.GameObjects.Sprite {

  constructor(scene, x, y, texture, id, order, xGrid, yGrid, direction) {
    super(scene, x, y, texture);
    this.scene = scene;
    this.id = id;
    this.order = order;
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
    this.bonus = 0;
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
    if(item_index === 30) {
      player.coin = player.coin + value;
      player.toolbar.coinText.setText(player.coin);
    }
    else if(item_index === 32) {
      player.ruby = player.ruby + value;
      player.toolbar.rubyText.setText(player.ruby);
    }
    else if(item_index === 31) {
      player.crystal = player.crystal + value;
      player.toolbar.crystalText.setText(player.crystal);
    }
  }

  score() {
    let score = this.energy + this.bonus + this.coin * CST.COIN_POINT + this.ruby * CST.RUBY_POINT + this.crystal * CST.CRYSTAL_POINT;
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

    if (player.direction === CST.UP) {
      newGrid.x = player.xGrid;
      newGrid.y = player.yGrid - 1;
    } else if (player.direction === CST.RIGHT) {
      newGrid.x = player.xGrid + 1;
      newGrid.y = player.yGrid;
    } else if (player.direction === CST.DOWN) {
      newGrid.x = player.xGrid;
      newGrid.y = player.yGrid + 1;
    } else if (player.direction === CST.LEFT) {
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
    let obstacle = this.scene.obstacles[newGrid.y][newGrid.x]
    if(ground && ground.properties['move'] && (obstacle.index === -1 || obstacle.index === 18)) {
      return(true);
    }
    else {
      return(false);
    }
  }

  trapAhead() {
    let player = this;
    let newGrid = player.gridAhead();
    let obstacle = this.scene.obstacles[newGrid.y][newGrid.x]
//    console.log("trap", newGrid, obstacle);
    return (obstacle.index === 18 && obstacle.obj.frame.name === CST.TRAP_ON) 
  }

  move(callback = (data) => {}) {
    let player = this;
    let newGrid = player.gridAhead();

    if(player.energy <= 0) {
      this.hangUp(callback);
      return;
    }

    if(player.pathAhead()) {
      this.scene.sound.play('move');
      this.scene.tweens.add({
        targets: player,
        x: newGrid.x * 64 + 32,
        y: newGrid.y * 32 + 64,
        ease: 'Bounce',
        duration: 1000,
        repeat: 0,
        yoyo: false,
        onComplete: function() {
          if(player.trapAhead()) {
            player.setFrame(CST.FALL);        
            player.scene.sound.play('hangup');
            player.updateEnergy(-1 * player.energy);
            player.scene.time.delayedCall(1000, () => {
              player.reposition();
              player.setFrame(player.direction);
              ui.log('trapped:', player.xGrid, player.yGrid, player.direction);
              callback(false);
            });
          }
          else {
            player.xGrid = newGrid.x;
            player.yGrid = newGrid.y;
            player.setDepth(newGrid.y + 1);
            player.updateEnergy(-1);
            ui.log('moved:', player.xGrid, player.yGrid, player.direction);
            callback(true);
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
          callback(true);
        }
      });
    }
  }

  stopTrap(callback = (data) => {}) {
    let player = this;
    let newGrid = player.gridAhead();
    let trap = this.scene.obstacles[newGrid.y][newGrid.x]

    if(player.energy <= 0) {
      player.hangUp(callback);
      return;
    }

    if(trap.index === 18) {
      trap.timer.paused = true;
      trap.obj.setFrame(CST.TRAP_OFF);
      player.scene.sound.play('disarm');
      player.scene.time.delayedCall(1000, () => {
        ui.log('trap stopped:', player.xGrid, player.yGrid, player.direction);
        callback(true);
      });
      player.scene.time.delayedCall(3000, () => {
        trap.timer.paused = false;
      });
    }
    else {
      player.hangUp();
    }
    player.updateEnergy(- 1);
  }

  turn(step, callback = (data) => {}) {
    let player = this;
    //Modulo calculation to get a new direction
    let new_direction = ((this.direction + step) % 4 + 4) % 4;
    ui.log('new_direction:', new_direction);

    if(player.energy <= 0) {
      this.hangUp(callback);
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
        callback(true);
      }
    });
  }

  hangUp(callback = (data) => {}) {
    let player = this;
    this.scene.sound.play('hangup');
    this.scene.tweens.add({
      targets: player,
      y: player.y - 10,
      ease: 'Bounce',
      duration: 100,
      repeat: 0,
      yoyo: true,
      onComplete: function() {
        player.setFrame(CST.FALL);        
        ui.log('hangup:', player.x, player.y, player.direction);
        player.scene.time.delayedCall(1000, () => {
          player.setFrame(player.direction);
          callback(false);
        });
      }
    });
  }

  pickUp(callback = (data) => {}) {
    let player = this;

    if(player.energy <= 0) {
      this.hangUp(callback);
      return;
    }

    let item = this.scene.items[player.yGrid][player.xGrid];
    if(item.index != -1) {
      ui.log('pick_up:', item);
      item.obj.setVisible(false); 
      this.scene.sound.play('pickup');
      player.updateEnergy(- 1);
      player.updateItem(item.index, 1);
      player.scene.time.delayedCall(1000, () => {
        ui.log('picked up:', player.xGrid, player.yGrid, player.direction);
        callback(true);
      });
    }
    else {
      this.hangUp(callback);      
    }
  }

  anotherPlayer() {
    let player = this;
    let players = this.scene.players;
    for(let i = 0; i < players.length; i++) {
      if(player.id != players[i].id && player.xGrid === players[i].xGrid && player.yGrid === players[i].yGrid) {
        return(players[i]);
      }
    }
    return(null); 
  }

  steal(callback = (data) => {}) {
    let player = this;
    let anotherPlayer = player.anotherPlayer();

    if(player.energy <= 0 || !anotherPlayer) {
      this.hangUp(callback);
      return;
    }

    if(Phaser.Utils.Array.GetRandom([true, false, false])) {
      if(anotherPlayer.crystal > 0) {
        anotherPlayer.updateItem(31, -1);
        player.updateItem(31, 1);
      }
      else if(anotherPlayer.ruby > 0) {
        anotherPlayer.updateItem(32, -1);
        player.updateItem(32, 1);
      }
      else if(anotherPlayer.coin > 0) {
        anotherPlayer.updateItem(30, -1);
        player.updateItem(30, 1);
      }
      this.scene.sound.play('pickup');
      player.updateEnergy(- 1);
      player.scene.time.delayedCall(1000, () => {
        ui.log('Took an item:', player.xGrid, player.yGrid, player.direction);
        callback(true);
      });
    }
    else {
      this.hangUp(callback);
    }
  }
}