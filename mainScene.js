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
    this.load.image("stage_tileset", "../assets/stage_tileset.png");
    this.load.tilemapTiledJSON("map", "../assets/level01.json");

    this.load.atlas("textures", "assets/images/textures.png", "assets/images/textures.json")
    this.load.image("dice-albedo", "assets/images/dice-albedo.png");
    this.load.obj("dice-obj", "assets/images/dice.obj");

    this.load.audio("move", "assets/audio/move.mp3");
    this.load.audio("turn", "assets/audio/turn.mp3");
    this.load.audio("stuck", "assets/audio/stuck.mp3");
  }
  
  create() {
  
    const map = this.make.tilemap({ key: "map" });
    
    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = map.addTilesetImage("stage_tileset", "stage_tileset");
  
    // Parameters: layer name (or index) from Tiled, tileset, x, y
    this.belowLayer = map.createLayer("Ground", tileset, 0, 0);
    this.worldLayer = map.createLayer("Fences", tileset, 0, 0);
  
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
    this.players = []//31,27
    const animals = [["Cat", 31, 27, 2], ["Chick", 31, 507, 2], ["Pig", 991, 27, 2], ["Rabbit", 991, 507, 2]]
     for(let i = 0; i < num; i++) {
      let name = animals[i][0];
      let x = animals[i][1];
      let y = animals[i][2];
      let direction = animals[i][3];
      this.textures.addSpriteSheetFromAtlas(name, { frameHeight: 64, frameWidth: 64, atlas: "textures", frame: name + "_Spritesheet" })
      this.players[i] = this.physics.add.sprite(x, y, name);
      this.players[i].setFrame(direction);
      this.players[i].direction = direction;  
      this.players[i].power = 0;
      this.players[i].id = i;
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
  
    let tile = this.worldLayer.getTileAtWorldXY(new_x, new_y, true);
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