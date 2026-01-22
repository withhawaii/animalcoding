class Player extends Phaser.GameObjects.Sprite {

  constructor(scene, x, y, texture, id, order, direction) {
    super(scene, x, y, texture);
    this.scene = scene;
    this.id = id;
    this.order = order;
    this.x = x;
    this.y = y;
    if(this.scene.ground) {
      const grid = this.scene.ground.getTileAtWorldXY(x, y, true);
      this.xGrid = grid.x;
      this.yGrid = grid.y;
    }
    this.direction = direction;  
    this.energy = 0;
    this.coin = 0;
    this.ruby = 0;
    this.crystal = 0;
    this.bonus = 0;
    this.code = "";
    this.setFrame(this.direction);
    this.setDepth(this.yGrid + 0.5);
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
    if(item_index === CST.COIN) {
      player.coin = player.coin + value;
      player.toolbar.setItem(item_index, player.coin);
    }
    else if(item_index === CST.RUBY) {
      player.ruby = player.ruby + value;
      player.toolbar.setItem(item_index, player.ruby);
    }
    else if(item_index === CST.CRYSTAL) {
      player.crystal = player.crystal + value;
      player.toolbar.setItem(item_index, player.crystal);
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

  grid(rDirection = CST.TOWARDS_AHEAD) {
    let player = this;
    let newGrid = {}
    let newDirection;
    if(rDirection === CST.TOWARDS_AHEAD) {
      newDirection = player.direction;
    }
    else {
      //Modulo calculation to get a new direction
      newDirection = ((player.direction + rDirection) % 4 + 4) % 4;
    }
    if (newDirection === CST.UP) {
      newGrid.x = player.xGrid;
      newGrid.y = player.yGrid - 1;
    } else if (newDirection === CST.RIGHT) {
      newGrid.x = player.xGrid + 1;
      newGrid.y = player.yGrid;
    } else if (newDirection === CST.DOWN) {
      newGrid.x = player.xGrid;
      newGrid.y = player.yGrid + 1;
    } else if (newDirection === CST.LEFT) {
      newGrid.x = player.xGrid - 1;
      newGrid.y = player.yGrid;
    }

    return newGrid;
  }

  path(rDirection = CST.TOWARDS_AHEAD) {
    let player = this;
    let newGrid = player.grid(rDirection);

    //Move only when a solid ground exists and no obstacle on the way
    let ground = this.scene.ground.getTileAt(newGrid.x, newGrid.y, true);
    let obstacle = this.scene.getObstacle(newGrid.x, newGrid.y);
    if(obstacle && obstacle.isTrap()) {
      obstacle = null;
    }
    if(ground && ground.properties['move'] && !obstacle) {
      return(true);
    }
    else {
      return(false);
    }
  }

  trap(rDirection = CST.TOWARDS_AHEAD) {
    let player = this;
    let newGrid = player.grid(rDirection);
    let obstacle = this.scene.getObstacle(newGrid.x, newGrid.y);
    return (obstacle && obstacle.isTrap() && obstacle.isTrapOn()) 
  }

  move(callback = (data) => {}) {
    let player = this;
    let newGrid = player.grid(CST.TOWARDS_AHEAD);

    if(player.energy <= 0) {
      this.hangUp(callback);
      return;
    }

    if(player.path()) {
      player.setDepth(newGrid.y + 0.5);
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
          if(player.trap(CST.TOWARDS_AHEAD)) {
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
            player.updateEnergy(-1);
            ui.log('moved:', player.xGrid, player.yGrid, player.direction, player.depth);
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
    let newGrid = player.grid(CST.TOWARDS_AHEAD);
    let obstacle = this.scene.getObstacle(newGrid.x, newGrid.y);
    
    if(player.energy <= 0) {
      player.hangUp(callback);
      return;
    }

    if(obstacle && obstacle.isTrap()) {
      obstacle.stopTrap();
      player.scene.time.delayedCall(1000, () => {
        ui.log('trap stopped:', player.xGrid, player.yGrid, player.direction);
        callback(true);
      });
    }
    else {
      player.hangUp();
    }
    player.updateEnergy(- 1);
  }

  turn(rDirection, callback = (data) => {}) {
    let player = this;
    //Modulo calculation to get a new direction
    let newDirection = ((this.direction + rDirection) % 4 + 4) % 4;
    ui.log('newDirection:', newDirection);

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
        player.direction = newDirection;
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
          if(player.energy <= 0) {
            player.scene.tweens.add({
              targets: player.toolbar.energyText,
              scale: 1.5,
              duration: 100,
              yoyo: true
            });
          }
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

    let item = this.scene.getItem(player.xGrid, player.yGrid);
    if(item && item.isCollectible() && item.count > 0) {
      ui.log('pick_up:', item);
      this.scene.sound.play('pickup');
      item.setCount(item.count - 1);
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

  eat(callback = (data) => {}) {
    let player = this;

    if(player.energy <= 0) {
      this.hangUp(callback);
      return;
    }

    let item = this.scene.getItem(player.xGrid, player.yGrid);
    if(item && item.isFood() && item.count > 0) {
      ui.log('eat:', item);
      this.scene.sound.play('charged');
      item.setCount(item.count - 1);
      if(item.index === CST.CUCUMBER) {
        player.updateEnergy(CST.CUCUMBER_POINT - 1);
      }
      else if(item.index === CST.CARROT) {
        player.updateEnergy(CST.CARROT_POINT - 1);
      }
      else if(item.index === CST.TOMATO) {
        player.updateEnergy(CST.TOMATO_POINT - 1);
      }
      player.scene.time.delayedCall(1000, () => {
        ui.log('eat up:', player.xGrid, player.yGrid, player.direction);
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
        ui.log('Stole an item:', player.xGrid, player.yGrid, player.direction);
        callback(true);
      });
    }
    else {
      this.hangUp(callback);
    }
  }
}