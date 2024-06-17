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
    this.load.tilemapTiledJSON("map", "tilemap/level02.json");

    this.load.spritesheet('objects', 'tilemap/objects.png', { frameWidth: 64, frameHeight: 64 });
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
          currentPlayer.setEnergy(currentPlayer.energy + diceValue);
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
    this.ground = this.map.createLayer("ground", stage, 0, 64);

    //Manually render obstacles as images
    this.obstacles = [];
    this.obstacles = this.map.getLayer("obstacles").data;
    for (let y = 0; y < this.obstacles.length; y++) {
      for (let x = 0; x < this.obstacles[y].length; x++) {
        let tileData = this.obstacles[y][x];
        if(tileData.index >= 0) {
          this.obstacles[y][x].obj = this.add.image(tileData.pixelX, tileData.pixelY + 64, 'objects', tileData.index - 1 -64)
          this.obstacles[y][x].obj.setOrigin(0, 0.5);
          this.obstacles[y][x].obj.depth = y;
        }
      }
    }

    //Manually render items as images
    this.items = this.map.getLayer("items").data;
    for (let y = 0; y < this.items.length; y++) {
      for (let x = 0; x < this.items[y].length; x++) {
        let tileData = this.items[y][x];
        if(tileData.index >= 0) {
          this.items[y][x].obj = this.add.image(tileData.pixelX, tileData.pixelY + 64, 'objects', tileData.index - 1 -64)
          this.items[y][x].obj.setOrigin(0, 0.5);
          this.items[y][x].obj.depth = y;
          this.items[y][x].obj.postFX.addShine(Phaser.Math.FloatBetween(0.1, 0.5));
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
      this.players[i] = new Player(this, x, y + 64 - 16, name);
      this.players[i].xGrid = starting_point.x;
      this.players[i].yGrid = starting_point.y;
      this.players[i].direction = direction;  
      this.players[i].id = i;
      this.players[i].setDepth(0);
      this.players[i].setFrame(direction);
      this.players[i].avatar = this.add.image(ax, ay, "textures", name +  "_Avatar_Rounded").setOrigin(0, 0);
      this.players[i].energy = 0;
      this.players[i].energyText = this.add.text(ax + 80, ay + 16, this.players[i].energy, { fontFamily: 'Arial Black', fontSize: 24, color: '#c51b7d' }).setStroke('#de77ae', 6);
      this.players[i].score = 0;
      this.players[i].scoreText = this.add.text(ax + 120, ay + 36, `Score: ${this.players[i].score}`, {fontSize: '18px',  color: '#ffffff', fill: '#000'});
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