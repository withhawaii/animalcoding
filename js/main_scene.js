class MainScene extends Phaser.Scene {
 
  constructor() {
    super('Main');
  }
  
  create() {
    this.isStarted = false;
    this.createBackground();
    this.createMap();
    this.createPlayers();
    this.createDice();
    this.createSounds();
    this.events.once('shutdown', this.shutdown, this);
    this.stageConfig = CST.STAGE_CONFIG[this.game.config.stage];
    this.bgm = this.sound.get(this.stageConfig.bgm);
    this.turnCount = 1;
    this.turnAllowance = this.stageConfig.turn;
    this.rollCount = 0;
    this.rollAllowance = 1;
    this.errorCount = 0;
    this.errorAllowance = 1;
    this.flags = {};

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
      this.items[i] = new Item(this, items[i].x, items[i].y + 32, 'objects', items[i].gid, objectsTileset.firstgid, this.getCustomProperty(items[i], 'count'), this.getCustomProperty(items[i], 'player'))
    }
  }
  
  createPlayers() {
    let players_json = JSON.parse(localStorage.getItem('players')).filter(player => player.name.trim() !== "")
    if(this.game.config.shuffle) {
      players_json = Phaser.Utils.Array.Shuffle(players_json); 
    }
    const player_coordinates = this.map.getObjectLayer('players').objects;
    const toolbar_coordinates = [[0,0],[724,0],[724,640],[0,640]];
    this.players = [];
    for(let i = 0; i < players_json.length; i++) {
      let sprite = players_json[i].sprite;
      let name = players_json[i].name;
      let id = players_json[i].id;
      this.players[i] = new Player(this, player_coordinates[i].x, player_coordinates[i].y + 64 - 16, sprite, id, i, this.getCustomProperty(player_coordinates[i], 'direction'));
      this.players[i].toolbar = new PlayerToolbar(this, toolbar_coordinates[i][0], toolbar_coordinates[i][1], sprite, name);
      if(this.game.config.debug) {
       this.players[i].updateItem(30, 5);
       this.players[i].updateItem(31, 5);
       this.players[i].updateItem(32, 5);
      }
    }

    //Delete items for non-existing players
    for(let item of this.items) {
      if (item.player >= players_json.length) {
        item.setCount(0);
      }
    }
    this.currentPlayer = this.players[0];
  }

  createDice() {
    this.dice = new Dice(this, this.scale.width / 2, this.scale.height / 2, 1000);
    this.dice.setInteractive();
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
    localStorage.setItem('config', JSON.stringify(config_json));

    let players_json = JSON.parse(localStorage.getItem('players'));
    for(let player of this.players) {
      players_json[player.id][this.game.config.stage] = {score: player.score(), energy: player.energy, star: player.star, coin: player.coin, ruby: player.ruby, crystal: player.crystal};
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