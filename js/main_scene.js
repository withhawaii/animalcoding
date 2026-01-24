class MainScene extends Phaser.Scene {
 
  constructor() {
    super('Main');
  }
  
  create() {
    const config_json = JSON.parse(localStorage.getItem('config')) || {};
    this.stageSaved = config_json[this.game.config.stage] || {}
    this.stageConfig = CST.STAGE_CONFIG[this.game.config.stage];

    if(this.stageSaved.turnCount) {
      this.turnCount = this.stageSaved.turnCount;
    }
    else {
      this.turnCount = 1;
    }
    this.turnAllowance = this.stageConfig.turn;
    this.isStarted = false;
    this.rollCount = 0;
    this.rollAllowance = 1;
    this.errorCount = 0;
    this.errorAllowance = 1;
    this.flags = {};

    this.createBackground();
    this.createMap();
    this.createPlayers();
    this.createDice();
    this.createSounds();
    this.events.once('shutdown', this.shutdown, this);
    this.bgm = this.sound.get(this.stageConfig.bgm);
    this.toolbar = new StageToolbar(this, 1024/2, 0);

    ui.loadSnippets(this.stageConfig.snippets);
    ui.editor.setReadOnly(true);
    ui.enableButton('btn_help');
    if(this.stageConfig.video) {
      ui.enableButton('btn_open_video').click();
    }
    else {
      ui.disableButton('btn_open_video');
      this.startStage();
    }
  }

  createBackground() {
    this.clouds = this.physics.add.group();
    for(let i = 0; i < 4; i++) {
      this.clouds.create(Phaser.Math.Between(0, 1024), Phaser.Math.Between(0, 704), 'textures',`Cloud_0${i + 1}`).setOrigin(0, 0).setVelocity(Phaser.Math.Between(5, 30), 0);
    }
  }

  createMap() {
    this.map = this.make.tilemap({ key: this.game.config.stage });
    const groundTileset = this.map.addTilesetImage('ground', 'ground');
    this.ground = this.map.createLayer('ground', groundTileset, 0, 64);

    const objectsTileset = this.map.getTileset('objects');
    this.obstacles = [];
    const obstacles = this.map.getObjectLayer('obstacles').objects;
    for (let i = 0; i < obstacles.length; i++) {
      this.obstacles[i] = new Obstacle(this, obstacles[i].x, obstacles[i].y + 32, 'objects', obstacles[i].gid, objectsTileset.firstgid);
    }

    this.items = [];
    const items = this.map.getObjectLayer('items').objects;
    for (let i = 0; i < items.length; i++) {
      let item_count;
      if(this.stageSaved.items) {
        item_count = this.stageSaved.items[i];
      }
      else {
        item_count = this.getCustomProperty(items[i], 'count') || 1;
      }
      this.items[i] = new Item(this, items[i].x, items[i].y + 32, 'objects', items[i].gid, objectsTileset.firstgid, item_count, this.getCustomProperty(items[i], 'player'))
    }
  }
  
  createPlayers() {
    let players_json = JSON.parse(localStorage.getItem('players')).filter(player => player.name.trim() !== "")
    if(players_json[0][this.game.config.stage]) {
      players_json = players_json.sort((a, b) => a[this.game.config.stage].order - b[this.game.config.stage].order); 
    }
    else if(this.game.config.shuffle) {
      players_json = Phaser.Utils.Array.Shuffle(players_json); 
    }
    const player_coordinates = this.map.getObjectLayer('players').objects;
    const toolbar_coordinates = [[0,0],[724,0],[724,640],[0,640]];
    this.players = [];
    for(let i = 0; i < players_json.length; i++) {
      let sprite = players_json[i].sprite;
      let id = players_json[i].id;
      let name = players_json[i].name;      
      let x, y, direction, energy, coin, ruby, crystal, star;
      if(players_json[i][this.game.config.stage]) {
        x = players_json[i][this.game.config.stage].x;
        y = players_json[i][this.game.config.stage].y;
        direction = players_json[i][this.game.config.stage].direction;    
        energy = players_json[i][this.game.config.stage].energy;
        coin = players_json[i][this.game.config.stage].coin;
        ruby = players_json[i][this.game.config.stage].ruby;
        crystal = players_json[i][this.game.config.stage].crystal;
        star = players_json[i][this.game.config.stage].star;
      }
      else {
        x = player_coordinates[i].x;
        y = player_coordinates[i].y + 64 - 16;
        direction = this.getCustomProperty(player_coordinates[i], 'direction');  
        energy = 0;
        coin = 0;
        ruby = 0;
        crystal = 0;
        star = 0;
      }
      this.players[i] = new Player(this, x, y, sprite, id, i, direction, energy, coin, ruby, crystal, star);
      this.players[i].toolbar = new PlayerToolbar(this, toolbar_coordinates[i][0], toolbar_coordinates[i][1], sprite, name, this.players[i]);
      if(this.game.config.debug) {
        if(this.players[i].coin === 0)
          this.players[i].updateItem(CST.COIN, 5);
        if(this.players[i].ruby === 0)
          this.players[i].updateItem(CST.RUBY, 5);
        if(this.players[i].crystal === 0)
          this.players[i].updateItem(CST.CRYSTAL, 5);
      }
    }

    //Delete items for non-existing players
    for(let item of this.items) {
      if (item.player >= players_json.length) {
        item.setCount(0);
      }
    }

    if(this.stageSaved.currentOrder) {
      this.currentPlayer = this.players[this.stageSaved.currentOrder];
    }
    else {
      this.currentPlayer = this.players[0];
    }
  }

  createDice() {
    this.dice = new Dice(this, this.scale.width / 2, this.scale.height / 2, 1000);
    this.dice.hide();
    this.dice.on('pointerdown', () => {
      this.rollDice();
    });
  }

  createSounds() {
    this.sound.pauseOnBlur = false;
    for (let prop in CST.AUDIO) {
      this.sound.add(prop);
    }
    this.sound.volume = this.game.config.master_volume;
  }

  getItem(xGrid, yGrid) {
    return this.items.find(item => item.xGrid === xGrid && item.yGrid === yGrid);
  }

  getObstacle(xGrid, yGrid) {
    return this.obstacles.find(item => item.xGrid === xGrid && item.yGrid === yGrid);
  }

  getCustomProperty(object, key) {
    if(object.properties && object.properties.find(p => p.name === key)) {
      return(object.properties.find(p => p.name === key).value);  
    }
    else {
      return(null);
    }
  }

  startStage() {
    this.isStarted = true;
    this.sound.play('intro');
    this.showMessage(this.stageConfig.name, () => {
      this.bgm.play({loop: true, volume: this.game.config.bgm_volume});
      this.currentPlayer.bounce();
      this.dice.show();
    });
  }

  showMessage(message, callback) {
    const messageText = this.add.text(this.scale.width / 2, this.scale.height / 2, message, {
      fontFamily: '"Press Start 2P"',
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);
    messageText.setAlpha(0);
    messageText.setDepth(20);

    this.tweens.add({
      targets: messageText,
      alpha: 1,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        this.time.delayedCall(2000, () => {
          this.tweens.add({
            targets: messageText,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
              messageText.destroy();
              if (typeof callback === 'function') {
                callback(); 
              }
            }
          });
        });
      }
    });
  }  

  rollDice() {
    if(this.dice.isReadyToRoll() && !ui.isAnyModalActive()) {
      this.dice.roll((diceValue) => {
        this.currentPlayer.updateEnergy(diceValue);
        this.rollCount += 1;
        ui.log('Dice value:', diceValue, 'New AP:', this.currentPlayer.energy);
        if(this.rollCount >= this.rollAllowance) {
          this.dice.hide();
          this.rollCount = 0;
          ui.editor.setReadOnly(false);
          ui.enableButton('btn_run_code');
          ui.enableButton('btn_skip');
        }
        else {
          this.dice.show();
        }  
      });
    }
  }

  isAllItemsPicked() {
    for (let i = 0; i < this.items.length; i++) {
      if(this.items[i] && this.items[i].isCollectible() && this.items[i].count > 0) {
        ui.log('Item sill there:', this.items[i]);
        return(false);
      }
    }
    return(true);
  }

  changePlayer() {
    let delay = 0;

    if(this.currentPlayer.star === 0) {
      this.checkBonus();
    }  

    if(this.isAllItemsPicked()) {
      this.scene.start('Result');
    }
    
    //When starting a new turn with the first player
    if(this.currentPlayer.order === this.players.length - 1) {
      this.currentPlayer = this.players[0];
      this.rollAllowance = 1;
      this.turnCount += 1;

      if(this.turnAllowance) {
        if(this.turnCount > this.turnAllowance) {
          this.scene.start('Result');  
        }
        else if (this.turnCount === this.turnAllowance) {
          this.toolbar.updateTurn();
          this.showMessage('Final Turn!');
          this.bgm.pause();
          this.sound.play('final');
          delay += 5000;
        }
        else {
          this.toolbar.updateTurn();          
        }
      }

      if(this.stageConfig.double.includes(this.turnCount)) {
        this.time.delayedCall(delay, () => {
          this.rollAllowance = 2;
          this.showMessage('Double Roll!');
          this.bgm.pause();
          this.sound.play('double');
        });
        delay += 5000; 
      }
    }
    else {
      this.currentPlayer = this.players[this.currentPlayer.order + 1];
    }

    this.time.delayedCall(delay, () => {
      ui.log('New Player:', this.currentPlayer);
      this.errorCount = 0;
      this.flags = {};
      this.bgm.resume();
      this.currentPlayer.bounce();
      ui.editor.setReadOnly(true);
      ui.editor.setValue(this.currentPlayer.code, -1);
      this.dice.show();
    }); 
  }

  checkBonus() {
    let bonusCondition = false;
    if(this.game.config.stage === 'stage2' && this.flags['ForStatement']) {
      bonusCondition = true;
    }
    else if(this.game.config.stage === 'stage3' && this.flags['IfStatement']) {
      bonusCondition = true;        
    }
    else if(this.game.config.stage === 'stage4' && this.flags['FunctionDeclaration']) {
      bonusCondition = true;        
    }
    else if(['demo', 'stage5', 'stage6', 'stage7'].includes(this.game.config.stage) && Object.keys(this.flags).length > 0) {
      bonusCondition = true;        
    }

    if(bonusCondition) {
      this.currentPlayer.star = 1;
      this.currentPlayer.toolbar.addStar();
    }
  }

  saveRecords() {
    let config_json = JSON.parse(localStorage.getItem('config')) || {};
    config_json.master_volume = this.game.config.master_volume;
    config_json.bgm_volume = this.game.config.bgm_volume;
    config_json.stage = this.game.config.stage;
    config_json[this.game.config.stage] = {turnCount: this.turnCount, currentOrder: this.currentPlayer.order, items: []};
    for (let i = 0; i < this.items.length; i++) {
      config_json[this.game.config.stage].items[i] = this.items[i].count;
    }
    localStorage.setItem('config', JSON.stringify(config_json));

    let players_json = JSON.parse(localStorage.getItem('players'));
    for(let player of this.players) {
      let x = player.xGrid * 64 + 32;
      let y = player.yGrid * 32 + 64;
      players_json[player.id][this.game.config.stage] = {x: x, y: y, direction: player.direction, order: player.order, energy: player.energy, star: player.star, coin: player.coin, ruby: player.ruby, crystal: player.crystal, score: player.score()};
      players_json[player.id].total_score = 0;
      for(let stage of ['stage1', 'stage2', 'stage3', 'stage4', 'stage5']) {
        if(players_json[player.id][stage] && players_json[player.id][stage].score) {
          players_json[player.id].total_score += players_json[player.id][stage].score;
        }
      };
    };
    localStorage.setItem('players', JSON.stringify(players_json));
    ui.log('Data saved:', config_json, players_json);
  }

  update(time, delta) {
    const clouds = this.clouds.getChildren();
    for(let i = 0; i < clouds.length; i++) {
      if(clouds[i].x >= 1024) {
        clouds[i].setX(clouds[i].width * -1);
        clouds[i].setY(Phaser.Math.Between(0, 704));
      }
    }
  }

  shutdown() {
    this.saveRecords();
    this.sound.stopAll();
    this.tweens.killAll();
  }
}