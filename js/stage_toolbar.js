class StageToolbar extends Phaser.GameObjects.Container {
 
  constructor(scene, x, y) {
    super(scene);
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.background = this.scene.add.image(0, 0, 'textures', 'UI_Toolbar').setOrigin(0.5, 0);
    this.progressBar = this.scene.add.image(-72, 25, 'textures', 'Bar_Green').setOrigin(0, 0.5).setScale(0, 1);
    this.turnText = this.scene.add.text(0, 24, "", {fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#000000'}).setOrigin(0.5, 0.5);
//    this.turnText = this.scene.add.text(0, 34, "", {fontFamily: 'Fredoka', fontSize: '24px', color: '#ff3333', stroke: '#ffffff', strokeThickness: 4}).setOrigin(0.5, 0.5);
    this.infText = this.scene.add.text(50, 10, "∞", {fontFamily: '"Press Start 2P"', fontSize: '36px', color:  '#000000'}).setOrigin(0, 0.5);
    this.infText.setVisible(false);
    this.add(this.background);
    this.add(this.progressBar);
    this.add(this.turnText);
    this.add(this.infText);
    this.scene.add.existing(this);
    this.updateTurn();
    this.scene.emitter = this.scene.add.particles(0, 0, 'textures', {
      frame: 'Star',
      speed: { min: -200, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.2, end: 0 },
      lifespan: 1000,
      gravityY: 200,
      quantity: 20,
      emitting: false, 
    });
    this.scene.emitter.setDepth(100);     
  }

  updateTurn() {
    if(this.scene.turnLimit) {
      this.scene.tweens.killTweensOf(this.progressBar);        
      this.turnText.setText(`Turn: ${this.scene.turnCount}/${this.scene.turnLimit}`);
      this.scene.tweens.add({
        targets: this.progressBar,  
          scaleX: this.scene.turnCount / this.scene.turnLimit,          
          duration: 500, 
          ease: 'Sine.easeOut',        
        });
    }
    else {
      this.turnText.setText(`Turn:   `);
      this.infText.setVisible(true);
      this.progressBar.setScale(1, 1);
    }
  }
}