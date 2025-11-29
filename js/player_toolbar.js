class PlayerToolbar extends Phaser.GameObjects.Container {
 
  constructor(scene, x, y, texture, name) {
    super(scene);    
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.background = this.scene.add.image(0, 0, 'textures', 'UI_Toolbar_Icon').setOrigin(0, 0);
    this.avatar = this.scene.add.image(6, 6, 'textures', texture +  '_Avatar_Circle').setScale(0.8).setOrigin(0, 0);
    this.energyText = this.scene.add.text(82, 33, '0', { fontFamily: 'Arial Black', fontSize: 24, color: '#c51b7d' }).setStroke('#de77ae', 6).setOrigin(0.5, 0.5);
    this.nameText = this.scene.add.text(110, 13, name, {fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#ffffff', fill: '#000'});
    this.coinText = this.scene.add.text(148, 46, '0', {fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#ffffff', fill: '#000'}).setOrigin(0.5, 0.5);
    this.rubyText = this.scene.add.text(198, 46, '0', {fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#ffffff', fill: '#000'}).setOrigin(0.5, 0.5);
    this.crystalText = this.scene.add.text(240, 46, '0', {fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#ffffff', fill: '#000'}).setOrigin(0.5, 0.5);
    this.add(this.background);
    this.add(this.avatar);
    this.add(this.energyText);
    this.add(this.nameText);
    this.add(this.coinText);
    this.add(this.rubyText);
    this.add(this.crystalText);
    this.scene.add.existing(this);
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
}