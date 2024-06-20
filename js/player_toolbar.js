class PlayerToolbar extends Phaser.GameObjects.Container {
 
  constructor(scene, x, y, name) {
    super(scene);    
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.name = name;
    this.background = this.scene.add.image(0, 0, "textures", "UI_Toolbar_Ext").setOrigin(0, 0);
    this.avatar = this.scene.add.image(7, 6, "textures", name +  "_Avatar_Rounded").setScale(0.8).setOrigin(0, 0);
    this.energyText = this.scene.add.text(80, 16, "0", { fontFamily: 'Arial Black', fontSize: 24, color: '#c51b7d' }).setStroke('#de77ae', 6);
    this.scoreText = this.scene.add.text(120, 36, "Score: 0", {fontSize: '18px',  color: '#ffffff', fill: '#000'});
    this.add(this.background);
    this.add(this.avatar);
    this.add(this.energyText);
    this.add(this.scoreText);
    this.scene.add.existing(this);
  }
}