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
    this.turnsCount = 1;
    this.turnsAllowance = this.stageConfig.turns;
    this.rollCount = 0;
    this.rollAllowance = 1;
    this.errorCount = 0;
    this.errorAllowance = 1;

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
    //Manually render obstacles as images
    this.obstacles = this.map.getLayer('obstacles').data;
    for (let i = 0; i < this.obstacles.length; i++) {
      for (let j = 0; j < this.obstacles[i].length; j++) {
        let tileData = this.obstacles[i][j];
        if(tileData.index >= 0) {
          //Create sprites for traps
          if(tileData.index == 18) {
            this.obstacles[i][j].obj = this.add.sprite(tileData.pixelX, tileData.pixelY + 64, 'objects', tileData.index - objectsTileset.firstgid);
            this.obstacles[i][j].timer = this.time.addEvent({
              delay: Phaser.Math.Between(3000, 4000),
              loop: true, 
              callback: () => {
                if(this.obstacles[i][j].obj.frame.name == CST.TRAP_ON) {
                  this.obstacles[i][j].obj.setFrame(CST.TRAP_OFF);
                  this.sound.play('trap');
                }
                else {
                  if(!this.anyPlayersOnTrap(this.obstacles[i][j])) {
                    this.obstacles[i][j].obj.setFrame(CST.TRAP_ON);
                    this.sound.play('trap');
                  }
                }
              }
            });
          }
          else {
            this.obstacles[i][j].obj = this.add.image(tileData.pixelX, tileData.pixelY + 64, 'objects', tileData.index - objectsTileset.firstgid);
          }
          this.obstacles[i][j].obj.setOrigin(0, 0.5);
          this.obstacles[i][j].obj.depth = i;
        }
      }
    }

    //Manually render items as images
    this.items = this.map.getLayer('items').data;
    for (let i = 0; i < this.items.length; i++) {
      for (let j = 0; j < this.items[i].length; j++) {
        let tileData = this.items[i][j];
        if(tileData.index >= 0) {
          this.items[i][j].obj = this.add.image(tileData.pixelX, tileData.pixelY + 64, 'objects', tileData.index - objectsTileset.firstgid)
          this.items[i][j].obj.setOrigin(0, 0.5);
          this.items[i][j].obj.depth = i;
          this.items[i][j].obj.postFX.addShine(Phaser.Math.FloatBetween(0.1, 0.5));
        }
      }
    }
  }

  anyPlayersOnTrap(trap) {
    for(let i = 0; i < this.players.length ; i++){
      if(this.players[i].xGrid == trap.x && this.players[i].yGrid == trap.y) {
        return(true);
      }
    }
    return(false);
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
      let starting_point = this.ground.getTileAtWorldXY(player_coordinates[i].x, player_coordinates[i].y + 64, true);
      this.players[i] = new Player(this, player_coordinates[i].x, player_coordinates[i].y + 64 - 16, sprite, id, i, starting_point.x, starting_point.y, CST.DOWN);
      this.players[i].toolbar = new PlayerToolbar(this, toolbar_coordinates[i][0], toolbar_coordinates[i][1], sprite, name);
      if(this.game.config.debug) {
       this.players[i].updateItem(30, 5);
       this.players[i].updateItem(31, 5);
       this.players[i].updateItem(32, 5);
      }
    }
    this.currentPlayer = this.players[0];
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
      for (let j = 0; j < this.items[i].length; j++) {
        let tileData = this.items[i][j];
        if(this.items[i][j].obj && this.items[i][j].obj.visible) {
          ui.log('Item sill there:', this.items[i][j].obj);
          return(false);
        }
      }
    }
    return(true);
  }

  changePlayer() {
    let delay = 0;

    if(this.isAllItemsPicked()) {
      this.scene.start('Result');
    }
    //When starting a new turn with a the first player
    if(this.currentPlayer.order === this.players.length - 1) {
      this.currentPlayer = this.players[0];
      if(this.turnsAllowance) {
        this.turnsCount += 1;
        if(this.turnsCount > this.turnsAllowance) {
          this.scene.start('Result');  
        }
        else if (this.turnsCount === this.turnsAllowance) {
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
    }
    else {
      this.currentPlayer = this.players[this.currentPlayer.order + 1];
    }

    this.time.delayedCall(delay, () => {
      ui.log('New Player:', this.currentPlayer);
      this.errorCount = 0;
      this.bgm.resume();
      this.currentPlayer.bounce();
      ui.editor.setReadOnly(true);
      ui.editor.setValue(this.currentPlayer.code, -1);
      this.dice.show();
    }); 
  }

  saveRecords() {
    let config_json = JSON.parse(localStorage.getItem('config')) || {};
    config_json.master_volume = this.game.config.master_volume;
    config_json.bgm_volume = this.game.config.bgm_volume;
    localStorage.setItem('config', JSON.stringify(config_json));

    let players_json = JSON.parse(localStorage.getItem('players'));
    for(let player of this.players) {
      players_json[player.id][this.game.config.stage] = {score: player.score(), energy: player.energy, bonus: player.bonus, coin: player.coin, ruby: player.ruby, crystal: player.crystal};
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