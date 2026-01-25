class PlayerToolbar extends Phaser.GameObjects.Container {
 
  constructor(scene, x, y, texture, name, player) {
    super(scene);    
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.player = player;
    this.background = this.scene.add.image(0, 0, 'textures', 'UI_Toolbar_Plain').setOrigin(0, 0);
    this.avatar = this.scene.add.image(6, 6, 'textures', texture +  '_Avatar_Circle').setScale(0.8).setOrigin(0, 0);
    this.star = this.scene.add.image(50, 50, 'textures', 'Star').setScale(0.4).setOrigin(0.5, 0.5)
    this.star.postFX.addShine(Phaser.Math.FloatBetween(0.1, 0.5));
    this.energyText = this.scene.add.text(82, 33, player.energy, { fontFamily: 'Arial Black', fontSize: 24, color: '#c51b7d' }).setStroke('#de77ae', 6).setOrigin(0.5, 0.5);
    this.nameText = this.scene.add.text(110, 13, name, {fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#ffffff', fill: '#000'});
    this.coin = this.scene.add.image(120, 46, 'textures', 'Coin').setScale(0.7).setOrigin(0.5, 0.5);
    this.coinText = this.scene.add.text(145, 48, player.coin, {fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#ffffff', fill: '#000'}).setOrigin(0.5, 0.5);
    this.ruby = this.scene.add.image(175, 46, 'textures', 'Ruby').setScale(0.7).setOrigin(0.5, 0.5);
    this.rubyText = this.scene.add.text(205, 48, player.ruby, {fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#ffffff', fill: '#000'}).setOrigin(0.5, 0.5);
    this.crystal = this.scene.add.image(230, 48, 'textures', 'Crystal').setScale(0.6).setOrigin(0.5, 0.5);
    this.crystalText = this.scene.add.text(255, 48, player.crystal, {fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#ffffff', fill: '#000'}).setOrigin(0.5, 0.5);
    this.add(this.background);
    this.add(this.avatar);
    this.add(this.energyText);
    this.add(this.nameText);
    this.add(this.star);
    this.add(this.coin);
    this.add(this.ruby);
    this.add(this.crystal);
    this.add(this.coinText);
    this.add(this.rubyText);
    this.add(this.crystalText);
    this.scene.add.existing(this);

    if(this.player.star > 0) {
      this.star.setVisible(true);
    }
    else {
      this.star.setVisible(false);
    }
  }

  setEnergy(newEnergy) {
    let energyText = this.energyText;
    this.scene.tweens.addCounter({
      from: Number(energyText.text),
      to: newEnergy,
      duration: 1000,
      ease: 'linear',
      onUpdate: tween => {
        const value = Math.round(tween.getValue());
        energyText.setText(value);
      }
    });
  }

  setItem(item_index, newCount) {
    let targetText;
    if(item_index === CST.COIN) {
      targetText = this.coinText
    }
    else if(item_index === CST.RUBY) {
      targetText = this.rubyText
    }
    else if(item_index === CST.CRYSTAL) {
      targetText = this.crystalText
    }
    targetText.setText(newCount);
    this.scene.tweens.add({
      targets: targetText,
      scale: 1.5,
      duration: 100,
      yoyo: true
    });
  }

  blinkEnergy() {
    this.scene.tweens.add({
      targets: this.energyText,
      scale: 1.5,
      duration: 100,
      yoyo: true
    });
  }
  
  addStar() {
    const star = this.star;
    star.setVisible(true);
    this.scene.sound.play('star');
    this.scene.tweens.add({
        targets: star,
        scale: 1.5,
        duration: 800,
        ease: 'Back.easeOut',
        yoyo: true,
        onComplete: () => {
          const bounds = star.getBounds();
          this.scene.emitter.setPosition(bounds.x, bounds.y);
          this.scene.emitter.explode(30);
          this.scene.sound.play('cracker');
        }
    });

    this.scene.tweens.add({
        targets: star,
        angle: 360,
        duration: 1000,
        repeat: 2 
    });
  }
}