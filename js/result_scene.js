class ResultScene extends Phaser.Scene {
 
  constructor() {
    super("Result");
  }

  preload() {
    this.config = JSON.parse(localStorage.getItem('config'));
    if(this.config.debug) {
      console.log("Debug mode enabled.");
    }

    this.fontStyle = {fontFamily: '"Press Start 2P"', fontSize: '24px', color: '#ffffff', fill: '#ffffff'}
  }
  
  create() {
    this.createBackground();
    this.createPlayers();
    this.createSounds();
    this.sound.play("result");
  }

  createBackground() {
    this.add.rectangle(1024/2, 704/2 , 1024, 704, 0x000080).setOrigin(0.5, 0.5);
    this.add.image(1024/2, 48, "textures", "UI_Logo_01");
    this.add.image(1024/2, 250, "textures", "Podium");
    let coin = this.add.image(250, 348, "textures", "Coin").setOrigin(0.5, 0.5);
    let ruby = this.add.image(250, 396, "textures", "Ruby").setOrigin(0.5, 0.5);
    let crystal = this.add.image(250, 454, "textures", "Crystal").setOrigin(0.5, 0.5);
    ruby.postFX.addShine(Phaser.Math.FloatBetween(1, 2));
    crystal.postFX.addShine(Phaser.Math.FloatBetween(1, 2));
    coin.postFX.addShine(Phaser.Math.FloatBetween(1, 2));
    this.add.text(300, 500, "Errors:", this.fontStyle).setOrigin(1, 0.5);
    this.add.text(300, 550, "Scores:", this.fontStyle).setOrigin(1, 0.5);
  }

  createPlayers() {
    let players_sorted = Object.values(JSON.parse(localStorage.getItem('players'))) 
    this.players = [];
    for(let i = 0; i < players_sorted.length; i++) {
      let sprite = players_sorted[i].sprite;
      this.players[i] = new Player(this, 362 + 100 * i, 175 + 20 * i, sprite, i, 0, 0, CST.DOWN);
      if(i == 0) {
        this.players[i].startIdle();
      }

      let player_info = players_sorted[i][this.config.stage]
      this.add.text(362 + 100 * i, 350, player_info.coin, this.fontStyle).setOrigin(0.5, 0.5);
      this.add.text(362 + 100 * i, 400, player_info.ruby, this.fontStyle).setOrigin(0.5, 0.5);
      this.add.text(362 + 100 * i, 450, player_info.crystal, this.fontStyle).setOrigin(0.5, 0.5);
      this.add.text(362 + 100 * i, 500, player_info.error, this.fontStyle).setOrigin(0.5, 0.5);
      this.add.text(362 + 100 * i, 550, player_info.score, this.fontStyle).setOrigin(0.5, 0.5);

    }
    this.currentPlayer = this.players[0];
  }

  createSounds() {
    this.sound.pauseOnBlur = false;
    for (let prop in CST.AUDIO) {
      this.sound.add(prop);
    }
  }
  
  update(time, delta) {
  }
}