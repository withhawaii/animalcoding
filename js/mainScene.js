class MainScene extends Phaser.Scene {
 
  constructor() {
      super('Main');
  }

  preload() {
    this.load.image("tileset_base", "tilemap/tileset_base.png");
    this.load.image("tileset_top", "tilemap/tileset_top.png");
    this.load.tilemapTiledJSON("map", "tilemap/level00.json");

    this.load.atlas("textures", "images/textures.png", "images/textures.json")
    this.load.image("background", "images/background.v1.png");
    this.load.image("dice-albedo", "images/dice-albedo.png");
    this.load.obj("dice-obj", "images/dice.obj");

    this.load.audio("move", "audio/move.mp3");
    this.load.audio("turn", "audio/turn.mp3");
    this.load.audio("stuck", "audio/stuck.mp3");
    this.load.audio("powerup", "audio/powerup.mp3");
    this.load.audio("freeze", "audio/freeze.mp3");
  }
  
  create() {
  
    const background = this.add.image(0, 0, "background");
    background.setOrigin(0, 0);
    const map = this.make.tilemap({ key: "map" });
    this.map = map;
    const tileset_base = map.addTilesetImage("tileset_base", "tileset_base");
    const tileset_top = map.addTilesetImage("tileset_top", "tileset_top");
    this.belowLayer = map.createLayer("base", tileset_base, 0, 64);
    this.worldLayer = map.createLayer("top", tileset_top, 0, 64 - 32);
//    this.belowLayer = map.createLayer("base", tileset_base, 0, 0);
//    this.worldLayer = map.createLayer("top", tileset_top, 0, -32);
  
    this.sound.pauseOnBlur = false;
    this.sound.add('move');
    this.sound.add('turn');
    this.sound.add('stuck');
    this.sound.add('powerup');
    this.sound.add('freeze');
    
    this.create_players(4);
    this.dice = new Dice(this, this.scale.width / 2, this.scale.height / 2, 1000);

    this.input.on('pointerdown', () => {
      if(this.dice.isReadyToRoll()) {
        this.dice.roll((diceValue) => {
          currentPlayer.updatePower(diceValue);
          console.log('Dice value ', diceValue, 'New power', currentPlayer.power);
          this.dice.hide();
        });
      }
    });

    currentScene = this;
  }

  create_players(num) {
    const animals = this.map.getObjectLayer("players").objects;
    this.players = []
    this.powerValues = []
     for(let i = 0; i < num; i++) {
      let name = animals[i].name;
      let x = animals[i].x;
      let y = animals[i].y;
      let direction = 2;
      this.textures.addSpriteSheetFromAtlas(name, { frameHeight: 64, frameWidth: 64, atlas: "textures", frame: name + "_Spritesheet" })
      this.players[i] = new Player(this, x, y + 64 - 16, name);
      this.players[i].setFrame(direction);
      this.players[i].direction = direction;  
      this.players[i].power = 0;
      this.players[i].id = i;
      this.players[i].avatar = this.add.image(32 + i * 256, 670, "textures", name +  "_Avatar_Circle").setScale(0.5);
      this.players[i].powerStatus = this.add.text(52 + i * 256, 655, this.players[i].power, { fontFamily: 'Arial Black', fontSize: 24, color: '#c51b7d' }).setStroke('#de77ae', 6);
    }
    currentPlayer = this.players[0];
  }

  changePlayer() {
    currentPlayer.setFrame(currentPlayer.direction);
    if(currentPlayer.id + 1 >= this.players.length) {
      currentPlayer = this.players[0];
    }
    else {
      currentPlayer = this.players[currentPlayer.id + 1];
    }
    console.log('New Player', currentPlayer);
    this.dice.show();
  }
  
}