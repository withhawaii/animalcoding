class ResultScene extends Phaser.Scene {

  constructor() {
    super('Result');
  }
  
  create() {
    this.stage_config = CST.STAGE_CONFIG[this.game.config.stage];
    this.createBackground();
    this.createFireWorks();
    this.createPlayers();
    this.createSounds();
    this.events.once('shutdown', this.shutdown, this);

    this.input.on('pointerdown', () => {
      this.scene.stop('Result');
      if(this.stage_config.next) {
        this.game.config.stage = this.stage_config.next;
        this.scene.start('Main');
      }
      else {
        this.scene.start('Title');
      }
    });

    const result = this.sound.get('result');
    result.play({volume: this.game.config.bgm_volume})
    result.once('complete', () => {
      let ranking_text = "Total Ranking\n\n"
      let players_json = Object.values(JSON.parse(localStorage.getItem('players'))).sort((a, b) => b.total_score - a.total_score);
      for(let i = 0; i < players_json.length; i++) {
        ranking_text += `${i + 1}...${players_json[i].name} (${players_json[i].total_score} pts)\n` 
      }
      ranking_text += "\nGreat job! Everyone!!"
      ui.insertText(ranking_text);
    });
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
    const defaultFontStyle = {fontFamily: '"Press Start 2P"', fontSize: '24px', color: '#ffffff'}
    this.add.image(1024/2, 48, 'textures', 'UI_Title');
    this.add.image(1024/2, 230, 'textures', 'Podium');
    let coin = this.add.image(250, 348, 'textures', 'Coin').setOrigin(0.5, 0.5);
    let ruby = this.add.image(250, 396, 'textures', 'Ruby').setOrigin(0.5, 0.5);
    let crystal = this.add.image(250, 454, 'textures', 'Crystal').setOrigin(0.5, 0.5);
    ruby.postFX.addShine(Phaser.Math.FloatBetween(1, 2));
    crystal.postFX.addShine(Phaser.Math.FloatBetween(1, 2));
    coin.postFX.addShine(Phaser.Math.FloatBetween(1, 2));
//    this.add.text(1024/2, 48, this.stage_config.name + ' Ranking', {fontFamily: 'Fredoka', fontSize: '48px', color: '#ff3333', stroke: '#ffffff', strokeThickness: 4}).setOrigin(0.5, 0.5);
    this.add.text(1024/2, 48, this.stage_config.name + ' Ranking', {fontFamily: '"Press Start 2P"', fontSize: '24px', color: '#ff3333', stroke: '#ffffff', strokeThickness: 4}).setOrigin(0.5, 0.5);
    this.add.text(300, 500, 'AP:', defaultFontStyle).setOrigin(1, 0.5);
    this.add.text(300, 550, 'Bonus:', defaultFontStyle).setOrigin(1, 0.5);
    this.add.text(300, 600, 'Total:', defaultFontStyle).setOrigin(1, 0.5);

    let players_json = Object.values(JSON.parse(localStorage.getItem('players'))).sort((a, b) => b[this.game.config.stage].score - a[this.game.config.stage].score);
    ui.log(players_json);
    this.players = [];
    for(let i = 0; i < players_json.length; i++) {
      let sprite = players_json[i].sprite;
      this.players[i] = new Player(this, 362 + 100 * i, 155 + 20 * i, sprite, i, 0, 0, CST.DOWN);
      if(i == 0) {
        this.players[i].bounce();
      }
      else if(i == players_json.length - 1) {
        this.players[i].setFrame(CST.FALL);
      }
      let result = players_json[i][this.game.config.stage];
      this.add.text(362 + 100 * i, 295, players_json[i].name, {fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#ffffff'}).setOrigin(0.5, 0.5);
      this.add.text(362 + 100 * i, 350, result.coin, defaultFontStyle).setOrigin(0.5, 0.5);
      this.add.text(362 + 100 * i, 400, result.ruby, defaultFontStyle).setOrigin(0.5, 0.5);
      this.add.text(362 + 100 * i, 450, result.crystal, defaultFontStyle).setOrigin(0.5, 0.5);
      this.add.text(362 + 100 * i, 500, result.energy, defaultFontStyle).setOrigin(0.5, 0.5);
      this.add.text(362 + 100 * i, 550, result.bonus, defaultFontStyle).setOrigin(0.5, 0.5);
      this.add.text(362 + 100 * i, 600, result.score, defaultFontStyle).setOrigin(0.5, 0.5);
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
    emitter.setParticleTint(Phaser.Utils.Array.GetRandom([0xff4136, 0xff851b, 0xffdc00, 0x01ff70, 0x2ecc40, 0x7fdbff, 0x0074d9, 0xf012be, 0xb10dc9]));
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