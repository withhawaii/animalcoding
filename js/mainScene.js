class MainScene extends Phaser.Scene {
  players;
  currentPlayer;
  scene;
  audio;
  worldLayer;

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
    
    this.create_players(4);
    this.dice = new Dice(this, this.scale.width / 2, this.scale.height / 2, 1000);

    this.input.on('pointerdown', () => {
      if(this.dice.isReadyToRoll()) {
        this.dice.roll((diceValue) => {
          this.dice.hide();
          this.currentPlayer.power = this.currentPlayer.power + diceValue
          console.log('Dice value ', diceValue, 'New power', this.currentPlayer.power);
        });
      }
    });

    currentScene = this;
  }

  create_players(num) {
    const animals = this.map.getObjectLayer("players").objects;
    this.players = []
     for(let i = 0; i < num; i++) {
      let name = animals[i].name;
      let x = animals[i].x;
      let y = animals[i].y;
      let direction = 2;
      this.textures.addSpriteSheetFromAtlas(name, { frameHeight: 64, frameWidth: 64, atlas: "textures", frame: name + "_Spritesheet" })
      this.players[i] = this.physics.add.sprite(x, y + 64 - 16, name);
      this.players[i].setFrame(direction);
      this.players[i].direction = direction;  
      this.players[i].power = 0;
      this.players[i].id = i;
      this.add.image(32 + i * 256, 670, "textures", name +  "_Avatar_Circle").setScale(0.5);;
    }
    this.currentPlayer = this.players[0];
  }

  changePlayer() {
    if(this.currentPlayer.id + 1 >= this.players.length) {
      this.currentPlayer = this.players[0];
    }
    else {
      this.currentPlayer = this.players[this.currentPlayer.id + 1];
    }
    console.log('New Player', this.currentPlayer);
    this.dice.show();
  }
  
  turn(step) {
    let player = this.currentPlayer;
    let new_direction = player.direction + step
    const animationDelay = 200;

    if (new_direction > 3) {
      new_direction = 0;
    } else if (new_direction < 0) {
      new_direction = 3;
    }
    this.sound.play("turn");
    this.tweens.add({
      targets: player,
      y: player.y - 10,
      ease: "Bounce", // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: animationDelay,
      repeat: 0,
      yoyo: true,
      onComplete: function() {
        player.direction = new_direction;
        player.setFrame(player.direction);
        console.log("Player:", player.x, player.y, player.direction);
      }
    });
  }
  
  move() {
    let player = this.currentPlayer;
    let new_x = player.x;
    let new_y = player.y;
    const animationDelay = 500;
    
    //Moving UP
    if (player.direction == 0) {
      new_x = player.x;
      new_y = player.y - 32;
      //Moving RIGHT
    } else if (player.direction == 1) {
      new_x = player.x + 64;
      new_y = player.y;
      //Moving DOWN
    } else if (player.direction == 2) {
      new_x = player.x;
      new_y = player.y + 32;
      //Moving LEFT
    } else if (player.direction == 3) {
      new_x = player.x - 64;
      new_y = player.y;
    }
  
    let tile = this.worldLayer.getTileAtWorldXY(new_x, new_y - 32, true);
    console.log(tile);
    if(tile && tile.index === -1) {
      this.sound.play("move");
      this.tweens.add({
        targets: player,
        x: new_x,
        y: new_y,
        ease: "Bounce", // 'Cubic', 'Elastic', 'Bounce', 'Back'
        duration: animationDelay,
        repeat: 0,
        yoyo: false,
        onComplete: function() {
          console.log("Player:", player.x, player.y, player.direction);
        }
      });
    }
    else {
      this.sound.play("stuck");
      this.tweens.add({
        targets: player,
        x: new_x,
        y: new_y,
        ease: "Bounce", // 'Cubic', 'Elastic', 'Bounce', 'Back'
        duration: animationDelay,
        repeat: 0,
        yoyo: true,
        onComplete: function() {
          console.log("Player:", player.x, player.y, player.direction);
        }
      });
    }
  }



}