class Obstacle extends Phaser.GameObjects.Container {
  constructor(scene, x, y, xGrid, yGrid, texture, index, offset) {
    super(scene, x, y);
    this.index = index;
    this.xGrid = xGrid;
    this.yGrid = yGrid;

    if(this.isTrap()) {
      this.image = scene.add.sprite(0, 0, texture, index - offset).setOrigin(0, 0.5);
      this.image.timer = scene.time.addEvent({
        delay: Phaser.Math.Between(3000, 4000),
        loop: true, 
        callback: () => {
          if(this.image.frame.name === CST.TRAP_ON) {
            this.image.setFrame(CST.TRAP_OFF);
            scene.sound.play('trap');
          }
          else {
            if(!this.isAnyPlayersOnTrap()) {
              this.image.setFrame(CST.TRAP_ON);
              scene.sound.play('trap');
            }
          }
        }
      });
    }
    else {
      this.image = scene.add.image(0, 0, texture, index - offset).setOrigin(0, 0.5);
    }

    this.add(this.image);
    this.scene.add.existing(this);
    this.setDepth(yGrid);
  }

  isTrap() {
    return([18].includes(this.index));
  }

  isTrapOn() {
    return(this.image.frame.name === CST.TRAP_ON);
  }

  isAnyPlayersOnTrap() {
    for(let i = 0; i < this.scene.players.length ; i++) {
      if(this.scene.players[i].xGrid === this.xGrid && this.scene.players[i].yGrid === this.yGrid) {
        return(true);
      }
    }
    return(false);
  }

  stopTrap(duration = 3000) {
    this.image.timer.paused = true;
    this.image.setFrame(CST.TRAP_OFF);
    this.scene.sound.play('disarm');
    this.scene.time.delayedCall(3000, () => {
      this.image.timer.paused = false;
    });
  }
}