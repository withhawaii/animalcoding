class MainScene extends Phaser.Scene {
 
  constructor() {
    super('Main');
  }
  
  create() {
    this.createBackground();
    this.createMap();
    this.createPlayers();
    this.createDice();
    this.createSounds();
    this.events.once('shutdown', this.shutdown, this);

    const intro = this.sound.get('intro');
    this.bgm = this.sound.get('bgm_01');
    intro.on('complete', () => {
      this.bgm.play({loop: true, volume: this.game.config.bgm_volume});
      ui.currentPlayer.startIdle();
      this.dice.show();
    });
    intro.play({volume: this.game.config.bgm_volume});
  }

  createBackground() {
    this.clouds = this.physics.add.group();
    for(let i = 0; i < 4; i++) {
      this.clouds.create(Phaser.Math.Between(0, 1024), Phaser.Math.Between(0, 704), 'textures',`Cloud_0${i + 1}`).setOrigin(0, 0).setVelocity(Phaser.Math.Between(5, 30), 0);
    }
//    this.add.image(1024/2, 48, 'textures', 'UI_Logo_01');
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
          this.obstacles[i][j].obj = this.add.image(tileData.pixelX, tileData.pixelY + 64, 'objects', tileData.index - objectsTileset.firstgid)
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

  createPlayers() {
    let players = JSON.parse(localStorage.getItem('players'));
    let players_shuffled = Object.values(players).map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value)
    const player_coordinates = this.map.getObjectLayer('players').objects;
    const toolbar_coordinates = [[0,0],[756,0],[756,640],[0,640]];
    this.players = [];
    for(let i = 0; i < players_shuffled.length; i++) {
      let sprite = players_shuffled[i].sprite;
      let name = players_shuffled[i].name;      
      let starting_point = this.ground.getTileAtWorldXY(player_coordinates[i].x, player_coordinates[i].y + 64, true);
      this.players[i] = new Player(this, player_coordinates[i].x, player_coordinates[i].y + 64 - 16, sprite, i, starting_point.x, starting_point.y, CST.DOWN);
      this.players[i].toolbar = new PlayerToolbar(this, toolbar_coordinates[i][0], toolbar_coordinates[i][1], sprite, name);
    }
    ui.currentPlayer = this.players[0];
  }

  createDice() {
    this.dice = new Dice(this, this.scale.width / 2, this.scale.height / 2, 1000);
    this.dice.hide();
    this.dice.on('pointerdown', () => {
      if(this.dice.isReadyToRoll() && !ui.isAnyModalActive()) {
        this.dice.roll((diceValue) => {
          if(this.game.config.debug) {
            diceValue = 6;
          }
          ui.currentPlayer.updateEnergy(diceValue);
          ui.log('Dice value ', diceValue, 'New energy', ui.currentPlayer.energy);
          this.dice.hide();
          ui.enableButton('run_code');
          ui.enableButton('skip');
        });
      }
    });
  }

  createSounds() {
    this.sound.pauseOnBlur = false;
    for (let prop in CST.AUDIO) {
      this.sound.add(prop);
    }
    this.sound.volume = this.game.config.master_volume;
  }  

  changePlayer() {
    if(ui.currentPlayer.id + 1 >= this.players.length) {
      ui.currentPlayer = this.players[0];
    }
    else {
      ui.currentPlayer = this.players[ui.currentPlayer.id + 1];
    }
    ui.log('New Player', ui.currentPlayer);
    ui.currentPlayer.startIdle();
    this.dice.show();
  }

  saveRecords() {
    let config = JSON.parse(localStorage.getItem('config')) || {};
    config.master_volume = this.game.config.master_volume;
    config.bgm_volume = this.game.config.bgm_volume;
    localStorage.setItem('config', JSON.stringify(config));

    let players = JSON.parse(localStorage.getItem('players'));
    for(let i = 0; i < this.players.length; i++) {
      players[this.players[i].animal][this.game.config.stage] = {energy: this.players[i].energy, score: this.players[i].score, error: this.players[i].error, coin: this.players[i].coin, ruby: this.players[i].ruby, crystal: this.players[i].crystal};
    }
    localStorage.setItem('players', JSON.stringify(players));
    ui.log('Saved:', config, players);
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