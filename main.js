class Main extends Phaser.Scene {
  players;
  currentPlayer;
  scene;
  audio;
  worldLayer;
  animationDelay = 300;

  constructor() {
      super('Main');
  }

  preload() {
    // "this" === Phaser.Scene
    this.load.image("stage_tileset", "../assets/stage_tileset.png");
    this.load.tilemapTiledJSON("map", "../assets/level01.json");
    this.load.spritesheet("cat", "../assets/cat_spritesheet.png", { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet("chick", "../assets/chick_spritesheet.png", { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet("pig", "../assets/pig_spritesheet.png", { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet("rabbit", "../assets/rabbit_spritesheet.png", { frameWidth: 64, frameHeight: 64 });
    this.load.image("dice-albedo", "assets/dice-albedo.png");
    this.load.obj("dice-obj", "assets/dice.obj");
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
  
    this.players = []
    this.players[0] = this.physics.add.sprite(31, 27, "cat");
    this.players[0].setFrame(2);
    this.players[0].direction = 2;
    this.players[1] = this.physics.add.sprite(31, 507, "chick");
    this.players[1].setFrame(2);
    this.players[1].direction = 2;
    this.players[2] = this.physics.add.sprite(991, 27, "pig");
    this.players[2].setFrame(2);
    this.players[2].direction = 2;
    this.players[3] = this.physics.add.sprite(991, 507, "rabbit");
    this.players[3].setFrame(2);
    this.players[3].direction = 2;
    this.currentPlayer = this.players[0];

    const dice = new Dice(this.scale.width / 2, this.scale.height / 2, this, 1000);



    this.input.on('pointerdown', () => {
      console.log(dice.roll());
    });



    currentScene = this;
  }
  
  turn(step) {
    var player = this.currentPlayer;
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
      duration: this.animationDelay,
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
    var player = this.currentPlayer;
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
    if(tile && tile.index === -1) {
      this.audio["move"].play();
      this.tweens.add({
        targets: player,
        x: new_x,
        y: new_y,
        ease: "Bounce", // 'Cubic', 'Elastic', 'Bounce', 'Back'
        duration: this.animationDelay,
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
        duration: this.animationDelay,
        repeat: 0,
        yoyo: true,
        onComplete: function() {
          console.log("Player:", player.x, player.y, player.direction);
        }
      });
    }
  }

  createDice(x, y, scene, duration = 1000) {

    let diceIsRolling = false;

    const dice = scene.add.mesh(x, y, "dice-albedo");
    const shadowFX = dice.postFX.addShadow(0, 0, 0.006, 2, 0x111111, 10, .8);

    dice.addVerticesFromObj("dice-obj", 0.25);
    dice.panZ(6);

    dice.modelRotation.x = Phaser.Math.DegToRad(0);
    dice.modelRotation.y = Phaser.Math.DegToRad(-90);

    return (callback) => {
        if (!diceIsRolling) {
            diceIsRolling = true;
            const diceRoll = Phaser.Math.Between(1, 6);

            // Shadow
            scene.add.tween({
                targets: shadowFX,
                x: -8,
                y: 10,
                duration: duration -250,
                ease: "Sine.easeInOut",
                yoyo: true,
            });

            scene.add.tween({
                targets: dice,
                from: 0,
                to: 1,
                duration: duration,
                onUpdate: () => {
                    dice.modelRotation.x -= .02;
                    dice.modelRotation.y -= .08;
                },
                onComplete: () => {
                    switch (diceRoll) {
                        case 1:
                            dice.modelRotation.x = Phaser.Math.DegToRad(0);
                            dice.modelRotation.y = Phaser.Math.DegToRad(-90);
                            break;
                        case 2:
                            dice.modelRotation.x = Phaser.Math.DegToRad(90);
                            dice.modelRotation.y = Phaser.Math.DegToRad(0);
                            break;
                        case 3:
                            dice.modelRotation.x = Phaser.Math.DegToRad(180);
                            dice.modelRotation.y = Phaser.Math.DegToRad(0);
                            break;
                        case 4:
                            dice.modelRotation.x = Phaser.Math.DegToRad(180);
                            dice.modelRotation.y = Phaser.Math.DegToRad(180);
                            break;
                        case 5:
                            dice.modelRotation.x = Phaser.Math.DegToRad(-90);
                            dice.modelRotation.y = Phaser.Math.DegToRad(0);
                            break;
                        case 6:
                            dice.modelRotation.x = Phaser.Math.DegToRad(0);
                            dice.modelRotation.y = Phaser.Math.DegToRad(90);
                            break;
                    }
                },
                ease: "Sine.easeInOut",
            });

            // Intro dice
            scene.add.tween({
                targets: [dice],
                scale: 1.2,
                duration: duration - 200,
                yoyo: true,
                ease: Phaser.Math.Easing.Quadratic.InOut,
                onComplete: () => {
                    dice.scale = 1;
                    if (callback !== undefined) {
                        diceIsRolling = false;
                        callback(diceRoll);
                    }
                }
            });
        } else {
            console.log("Is rolling");
        }
  }

}


}