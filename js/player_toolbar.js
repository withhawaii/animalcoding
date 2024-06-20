class PlayerToolbar extends Phaser.GameObjects.Container {
 
  constructor(scene, x, y, texture) {
    super(scene);    
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.background = this.scene.add.image(0, 0, "textures", "UI_Toolbar_Ext").setOrigin(0, 0);
    this.avatar = this.scene.add.image(7, 6, "textures", texture +  "_Avatar_Circle").setScale(0.8).setOrigin(0, 0);
    this.energyText = this.scene.add.text(80, 16, "0", { fontFamily: 'Arial Black', fontSize: 24, color: '#c51b7d' }).setStroke('#de77ae', 6);
    this.scoreText = this.scene.add.text(120, 36, "Score: 0", {fontSize: '18px',  color: '#ffffff', fill: '#000'});
    this.add(this.background);
    this.add(this.avatar);
    this.add(this.energyText);
    this.add(this.scoreText);
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

  setScore(newScore) {
    let scoreText = this.scoreText;
    this.scene.tweens.addCounter({
      from: Number(scoreText.text.replace("Score: ", "")),
      to: newScore,
      duration: 1000,
      ease: 'linear',
      onUpdate: tween => {
        const value = Math.round(tween.getValue());
        scoreText.setText(`Score: ${value}`);
      }
    });
  }
}