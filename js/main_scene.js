class MainScene extends Phaser.Scene {
 
  constructor() {
      super('Main');
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

    this.load.spritesheet('stage_sprite', 'tilemap/stage.png', { frameWidth: 64, frameHeight: 32 });
  }
  
  create() {
    this.add.image(0, 0, "background").setOrigin(0, 0);
    this.createMap();

    this.sound.pauseOnBlur = false;
    for (let prop in CST.AUDIO) {
      this.sound.add(prop);
    }
    
    this.createPlayers(4);
    this.dice = new Dice(this, this.scale.width / 2, this.scale.height / 2, 1000);
    this.input.on('pointerdown', () => {
      if(this.dice.isReadyToRoll()) {
        this.dice.roll((diceValue) => {
          if(debug) {
            diceValue = 6;
          }
          currentPlayer.changeEnergy(diceValue);
          console.log('Dice value ', diceValue, 'New energy', currentPlayer.energy);
          this.dice.hide();
          enableButton("run_code");
        });
      }
    });
  }

  createMap() {
    this.map = this.make.tilemap({ key: "map" });
    const stage = this.map.addTilesetImage("stage", "stage");
    this.baseLayer = this.map.createLayer("base", stage, 0, 64);
    this.topLayer = this.map.createLayer("top", stage, 0, 64 );
//    this.itemsLayer = this.map.createLayer("items", tileset_items, 0, 64 - 32);

    //Manually render non-collidable tiles as images for 3D-like effects
    const topLayerData = this.map.getLayer("top").data;
    for (let y = 0; y < topLayerData.length; y++) {
      for (let x = 0; x < topLayerData[y].length; x++) {
        let tileData = topLayerData[y][x];
        if(tileData.index >= 0 && !tileData.properties['collide']) {
          const tile = this.add.image(tileData.pixelX, tileData.pixelY + 64, 'stage_sprite', tileData.index - 1)
          tile.setOrigin(0,0);
          tile.depth = 2; //Place in front of players
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
      this.textures.addSpriteSheetFromAtlas(name, { frameHeight: 64, frameWidth: 64, atlas: "textures", frame: name + "_Spritesheet" })
      this.players[i] = new Player(this, x, y + 64 - 16, name);
      this.players[i].setDepth(1);
      this.players[i].setFrame(direction);
      this.players[i].direction = direction;  
      this.players[i].energy = 0;
      this.players[i].id = i;
      this.players[i].avatar = this.add.image(ax, ay, "textures", name +  "_Avatar_Rounded").setOrigin(0, 0);
      this.players[i].energyStatus = this.add.text(ax + 80, ay + 16, this.players[i].energy, { fontFamily: 'Arial Black', fontSize: 24, color: '#c51b7d' }).setStroke('#de77ae', 6);
    }
    currentPlayer = this.players[0];
//    currentPlayer.idle();
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
//    currentPlayer.idle();
    this.dice.show();
  }
}