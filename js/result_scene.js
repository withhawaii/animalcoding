class ResultScene extends Phaser.Scene {

  constructor() {
    super('Result');
  }
  
  create() {
    this.createBackground();
    this.createFireWorks();
    this.createPlayers();
    this.createSounds();
    this.events.once('shutdown', this.shutdown, this);
    this.stage_config = CST.STAGE_CONFIG[this.game.config.stage];

    this.input.on('pointerdown', () => {
      this.game.config.stage = this.stage_config.next;
      this.scene.stop('Result');
      this.scene.start('Main');
    });
    this.sound.play('result', {volume: this.game.config.bgm_volume});
  }

  createBackground() {
    if (this.textures.exists('stars')) {
      this.textures.remove('stars');
    }
    const stars = this.textures.createCanvas('stars', 1024, 768);
    const ctx = stars.getContext();

    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, 1024, 768);
    ctx.fillStyle = '#ffffff';
    let i = 1024;
    while (i-- > 0) {
      ctx.globalAlpha = Phaser.Math.FloatBetween(0, 1);
      ctx.fillRect(Phaser.Math.Between(0, 1023), Phaser.Math.Between(0, 767), 1, 1);
    }

    stars.refresh();

    if (this.textures.exists('rocket')) {
      this.textures.remove('rocket');
    }
    this.textures.generate('rocket', {
      data: ['0123...'],
      palette: {
        0: '#fff2',
        1: '#fff4',
        2: '#fff8',
        3: '#ffff'
      },
      pixelWidth: 4
    });

    this.add.image(1024/2, 704/2, stars);
  }

  createFireWorks() {
    const emitterConfig = {
      alpha: { start: 1, end: 0, ease: 'Cubic.easeIn' },
      angle: { start: 0, end: 360, steps: 100 },
      rotate: { onEmit: this.updateParticleRotation, onUpdate: this.updateParticleRotation },
      blendMode: 'ADD',
      gravityY: 128,
      lifespan: 3000,
      quantity: 500,
      reserve: 500,
      scaleX: { onUpdate: (p) => Phaser.Math.Easing.Cubic.Out(1 - p.lifeT) },
      speed: { min: 128, max: 256 }
    };

    const emitter1 = this.add.particles(0, 0, 'rocket', emitterConfig).setFrequency(3000);
    const emitter2 = this.add.particles(0, 0, 'rocket', emitterConfig).setFrequency(4000);
    const emitter3 = this.add.particles(0, 0, 'rocket', emitterConfig).setFrequency(5000);

    this.updateEmitter(emitter1);
    this.updateEmitter(emitter2);
    this.updateEmitter(emitter3);

    this.time.addEvent({
      delay: emitter1.frequency,
      repeat: -1,
      callback: () => {
        this.updateEmitter(emitter1);
      }
    });

    this.time.addEvent({
      delay: emitter2.frequency,
      repeat: -1,
      callback: () => {
        this.updateEmitter(emitter2);
      }
    });

    this.time.addEvent({
      delay: emitter3.frequency,
      repeat: -1,
      callback: () => {
        this.updateEmitter(emitter3);
      }
    });
  }

  createPlayers() {
    const defaultFontStyle = {fontFamily: '"Press Start 2P"', fontSize: '24px', color: '#ffffff', fill: '#ffffff'}
    this.add.image(1024/2, 48, 'textures', 'UI_Logo_01');
    this.add.image(1024/2, 230, 'textures', 'Podium');
    let coin = this.add.image(250, 348, 'textures', 'Coin').setOrigin(0.5, 0.5);
    let ruby = this.add.image(250, 396, 'textures', 'Ruby').setOrigin(0.5, 0.5);
    let crystal = this.add.image(250, 454, 'textures', 'Crystal').setOrigin(0.5, 0.5);
    ruby.postFX.addShine(Phaser.Math.FloatBetween(1, 2));
    crystal.postFX.addShine(Phaser.Math.FloatBetween(1, 2));
    coin.postFX.addShine(Phaser.Math.FloatBetween(1, 2));
    this.add.text(300, 500, 'Errors:', defaultFontStyle).setOrigin(1, 0.5);
    this.add.text(300, 550, 'Score:', defaultFontStyle).setOrigin(1, 0.5);
    this.add.text(300, 600, 'Total:', defaultFontStyle).setOrigin(1, 0.5);

    let players_sorted = Object.values(JSON.parse(localStorage.getItem('players'))).sort((a, b) => b[this.game.config.stage].score - a[this.game.config.stage].score);
    ui.log(players_sorted);
    this.players = [];
    for(let i = 0; i < players_sorted.length; i++) {
      let sprite = players_sorted[i].sprite;
      this.players[i] = new Player(this, 362 + 100 * i, 155 + 20 * i, sprite, i, 0, 0, CST.DOWN);
      if(i == 0) {
        this.players[i].bounce();
      }
      else if(i == players_sorted.length - 1) {
        this.players[i].setFrame(4);
      }
      let player_info = players_sorted[i][this.game.config.stage];
      this.add.text(362 + 100 * i, 295, players_sorted[i].name, {fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#ffffff', fill: '#ffffff'}).setOrigin(0.5, 0.5);
      this.add.text(362 + 100 * i, 350, player_info.coin, defaultFontStyle).setOrigin(0.5, 0.5);
      this.add.text(362 + 100 * i, 400, player_info.ruby, defaultFontStyle).setOrigin(0.5, 0.5);
      this.add.text(362 + 100 * i, 450, player_info.crystal, defaultFontStyle).setOrigin(0.5, 0.5);
      this.add.text(362 + 100 * i, 500, player_info.error, defaultFontStyle).setOrigin(0.5, 0.5);
      this.add.text(362 + 100 * i, 550, players_sorted[i].score, defaultFontStyle).setOrigin(0.5, 0.5);
    }
    ui.currentPlayer = this.players[0];
  }

  createSounds() {
    this.sound.pauseOnBlur = false;
    for (let prop in CST.AUDIO) {
      this.sound.add(prop);
    }
    this.sound.volume = this.game.config.master_volume;
  }

  updateEmitter(emitter) {
    emitter.setPosition(1024 * Phaser.Math.FloatBetween(0.25, 0.75), 768 * Phaser.Math.FloatBetween(0, 0.5))
    emitter.setParticleTint(Phaser.Utils.Array.GetRandom(CST.TINTS));
  }

  updateParticleRotation(p) {
    return Phaser.Math.RadToDeg(Math.atan2(p.velocityY, p.velocityX));
  }
  
  update(time, delta) {
  }

  shutdown() {
    this.sound.stopAll();
    this.tweens.killAll();
  }
}