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
  }
  
  create() {
    this.add.image(0, 0, "background").setOrigin(0, 0);
    this.map = this.make.tilemap({ key: "map" });
    const tileset_base = this.map.addTilesetImage("tileset_base", "tileset_base");
    const tileset_top = this.map.addTilesetImage("tileset_top", "tileset_top");
    this.baseLayer = this.map.createLayer("base", tileset_base, 0, 64);
    this.topLayer = this.map.createLayer("top", tileset_top, 0, 64 - 32);
  
    this.sound.pauseOnBlur = false;
    for (let prop in CST.AUDIO) {
      this.sound.add(prop);
    }
    
    this.createPlayers(4);
    this.dice = new Dice(this, this.scale.width / 2, this.scale.height / 2, 1000);
    this.input.on('pointerdown', () => {
      if(this.dice.isReadyToRoll()) {
        this.dice.roll((diceValue) => {
          currentPlayer.changeEnergy(diceValue);
          console.log('Dice value ', diceValue, 'New energy', currentPlayer.energy);
          this.dice.hide();
        });
      }
    });
  }

  createPlayers(num) {
    const players = this.map.getObjectLayer("players").objects;
    this.players = []
    for(let i = 0; i < num; i++) {
      let name = players[i].name;
      let x = players[i].x;
      let y = players[i].y;
      let direction = CST.DOWN;
      this.textures.addSpriteSheetFromAtlas(name, { frameHeight: 64, frameWidth: 64, atlas: "textures", frame: name + "_Spritesheet" })
      this.players[i] = new Player(this, x, y + 64 - 16, name);
      this.players[i].setFrame(direction);
      this.players[i].direction = direction;  
      this.players[i].energy = 0;
      this.players[i].id = i;
      this.players[i].avatar = this.add.image(32 + i * 256, 670, "textures", name +  "_Avatar_Circle").setScale(0.5);
      this.players[i].energyStatus = this.add.text(52 + i * 256, 655, this.players[i].energy, { fontFamily: 'Arial Black', fontSize: 24, color: '#c51b7d' }).setStroke('#de77ae', 6);
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