class PlayerToolbar extends Phaser.GameObjects.Container {
 
  constructor(scene, x, y, texture, name) {
    super(scene);    
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.background = this.scene.add.image(0, 0, 'textures', 'UI_Toolbar_Icon').setOrigin(0, 0);
    this.avatar = this.scene.add.image(6, 6, 'textures', texture +  '_Avatar_Circle').setScale(0.8).setOrigin(0, 0);
    this.energyText = this.scene.add.text(70, 16, '0', { fontFamily: 'Arial Black', fontSize: 24, color: '#c51b7d' }).setStroke('#de77ae', 6);
    this.nameText = this.scene.add.text(120, 10, name, {fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#ffffff', fill: '#000'});
    this.coinText = this.scene.add.text(150, 40, '0', {fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#ffffff', fill: '#000'});
    this.rubyText = this.scene.add.text(200, 40, '0', {fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#ffffff', fill: '#000'});
    this.crystalText = this.scene.add.text(245, 40, '0', {fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#ffffff', fill: '#000'});
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