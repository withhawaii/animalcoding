class StageToolbar extends Phaser.GameObjects.Container {
 
  constructor(scene, x, y) {
    super(scene);
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.background = this.scene.add.image(0, 0, 'textures', 'UI_Toolbar_Frame').setOrigin(0.5, 0);
    this.progressBar = this.scene.add.image(-93, 34, 'textures', 'Bar').setOrigin(0, 0.5).setScale(0, 1);
    this.turnText = this.scene.add.text(0, 34, "", {fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#333333'}).setOrigin(0.5, 0.5);
//    this.turnText = this.scene.add.text(0, 34, "", {fontFamily: 'Fredoka', fontSize: '24px', color: '#ff3333', stroke: '#ffffff', strokeThickness: 4}).setOrigin(0.5, 0.5);
    this.infText = this.scene.add.text(50, 26, "∞", {fontFamily: '"Press Start 2P"', fontSize: '36px', color:  '#808080'}).setOrigin(0, 0.5);
    this.infText.setVisible(false);
    this.add(this.background);
    this.add(this.progressBar);
    this.add(this.turnText);
    this.add(this.infText);
    this.scene.add.existing(this);
    this.updateTurn();
  }

  updateTurn() {
    if(this.scene.turnsAllowance) {
      this.turnText.setText(`Turns: ${this.scene.turnsCount}/${this.scene.turnsAllowance}`);
      this.scene.tweens.add({
        targets: this.progressBar,  
          scaleX: this.scene.turnsCount / this.scene.turnsAllowance,          
          duration: 500, 
          ease: 'Sine.easeOut',        
        });
    }
    else {
      this.turnText.setText(`Turns:   `);
      this.infText.setVisible(true);
      this.progressBar.setScale(1, 1);
    }
  }
}