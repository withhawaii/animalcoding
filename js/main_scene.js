class MainScene extends Phaser.Scene {
 
  constructor() {
      super("Main");
  }

  preload() {
    for (let prop in CST.IMAGES) {
      this.load.image(prop, CST.IMAGES[prop]);
    }
  
    for (let prop in CST.AUDIO) {
      this.load.audio(prop, CST.AUDIO[prop]);
    }

    this.load.obj("dice_obj", "images/dice.obj");
    this.load.atlas("textures", "images/textures.png", "images/textures.json")
    this.load.tilemapTiledJSON("map", "tilemap/level00.json");
    this.load.spritesheet('objects', 'tilemap/objects.png', { frameWidth: 64, frameHeight: 64 });
  }
  
  create() {
    this.createBackground();
    this.createMap();
    this.createPlayers(4);
    this.createDice();
    this.createSounds();
  }

  createBackground() {
    this.clouds = this.physics.add.group();
    for(let i = 0; i < 4; i++) {
      this.clouds.create(Phaser.Math.Between(0, 1024), Phaser.Math.Between(0, 704), 'textures',`Cloud_0${i + 1}`).setOrigin(0, 0).setVelocity(Phaser.Math.Between(5, 30), 0);
    }
    this.add.image(1024/2, 48, "textures", "UI_Logo_01");
  }

  createMap() {
    this.map = this.make.tilemap({ key: "map" });
    const groundTileset = this.map.addTilesetImage("ground", "ground");
    this.ground = this.map.createLayer("ground", groundTileset, 0, 64);

    const objectsTileset = this.map.getTileset("objects");
    //Manually render obstacles as images
    this.obstacles = this.map.getLayer("obstacles").data;
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
    this.items = this.map.getLayer("items").data;
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

  createPlayers(num) {
    const players = this.map.getObjectLayer("players").objects;
    this.players = [];
    const avatar_origin = [[0,0],[768,0],[768,640],[0,640]];
    for(let i = 0; i < num; i++) {
      let name = players[i].name;
      let x = players[i].x;
      let y = players[i].y;
      let ax = avatar_origin[i][0];
      let ay = avatar_origin[i][1];
      let direction = CST.DOWN;
      let starting_point = this.ground.getTileAtWorldXY(x, y + 64, true);
      this.textures.addSpriteSheetFromAtlas(name, { frameHeight: 64, frameWidth: 64, atlas: "textures", frame: name + "_Spritesheet" })
      this.players[i] = new Player(this, x, y + 64 - 16, name, i, starting_point.x, starting_point.y, direction);
      this.players[i].toolbar = new PlayerToolbar(this, ax, ay, name);
    }
    currentPlayer = this.players[0];
    currentPlayer.startIdle();
  }

  createDice() {
    this.dice = new Dice(this, this.scale.width / 2, this.scale.height / 2, 1000);
    this.input.on('pointerdown', () => {
      if(this.dice.isReadyToRoll()) {
        this.dice.roll((diceValue) => {
          if(debug) {
            diceValue = 6;
          }
          currentPlayer.updateEnergy(diceValue);
          console.log('Dice value ', diceValue, 'New energy', currentPlayer.energy);
          this.dice.hide();
          enableButton("run_code");
          enableButton("skip");
        });
      }
    });
  }

  createSounds() {
    this.sound.pauseOnBlur = false;
    for (let prop in CST.AUDIO) {
      this.sound.add(prop);
    }
  }

  changePlayer() {
    currentPlayer.setFrame(currentPlayer.direction);
    if(currentPlayer.id + 1 >= this.players.length || debug) {
      currentPlayer = this.players[0];
    }
    else {
      currentPlayer = this.players[currentPlayer.id + 1];
    }
    console.log('New Player', currentPlayer);
    currentPlayer.startIdle();
    this.dice.show();
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
}