class Main extends Phaser.Scene {
  player;
  scene;
  audio;
  worldLayer;

  constructor() {
      super('Main');
  }

  preload() {
    // "this" === Phaser.Scene
    this.load.image("stage_tileset", "../assets/stage_tileset.png");
    this.load.tilemapTiledJSON("map", "../assets/level01.json");
    this.load.spritesheet("cat", "../assets/cat_spritesheet.png", { frameWidth: 64, frameHeight: 64 });
    this.load.audio("audio_move", "assets/audio/move.mp3");
    this.load.audio("audio_turn", "assets/audio/turn.mp3");
    this.load.audio("audio_stuck", "assets/audio/stuck.mp3");
  }
  
  create() {
  
    const map = this.make.tilemap({ key: "map" });
  
  
    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = map.addTilesetImage("stage_tileset", "stage_tileset");
  
    // Parameters: layer name (or index) from Tiled, tileset, x, y
    this.belowLayer = map.createLayer("Ground", tileset, 0, 0);
    this.worldLayer = map.createLayer("Fences", tileset, 0, 0);
  
    this.audio = []
    this.audio["move"] = this.sound.add('audio_move');
    this.audio["turn"] = this.sound.add('audio_turn');
    this.audio["stuck"] = this.sound.add('audio_stuck');
  
    this.player = this.physics.add.sprite(95, 155, "cat");
    this.player.setFrame(2);
    this.player.direction = 2;
  
    currentScene = this;
  }
  
  turn(step) {
    var player = this.player;
    var new_direction = player.direction + step
    if (new_direction > 3) {
      new_direction = 0;
    } else if (new_direction < 0) {
      new_direction = 3;
    }
    this.audio["turn"].play();
    this.tweens.add({
      targets: player,
      y: player.y - 10,
      ease: "Bounce", // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 100,
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
    var player = this.player;
    var new_x = player.x;
    var new_y = player.y;
    
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
  
    var tile = this.worldLayer.getTileAtWorldXY(new_x, new_y, true);
    if(tile.index === -1) {
      this.audio["move"].play();
      this.tweens.add({
        targets: player,
        x: new_x,
        y: new_y,
        ease: "Bounce", // 'Cubic', 'Elastic', 'Bounce', 'Back'
        duration: 1000,
        repeat: 0,
        yoyo: false,
        onComplete: function() {
          console.log("Player:", player.x, player.y, player.direction);
        }
      });
    }
    else {
      this.audio["stuck"].play();
      this.tweens.add({
        targets: this.player,
        x: new_x,
        y: new_y,
        ease: "Bounce", // 'Cubic', 'Elastic', 'Bounce', 'Back'
        duration: 500,
        repeat: 0,
        yoyo: true,
        onComplete: function() {
          console.log("Player:", this.player.x, this.player.y, this.player.direction);
        }
      });
    }
  }
}