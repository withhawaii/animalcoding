class TitleScene extends Phaser.Scene {
 
  constructor() {
    super('Title');
  }
  
  create() {
    this.createBackground();
  }

  createBackground() {
    this.clouds = this.physics.add.group();
    for(let i = 0; i < 4; i++) {
      this.clouds.create(Phaser.Math.Between(0, 1024), Phaser.Math.Between(0, 704), 'textures',`Cloud_0${i + 1}`).setOrigin(0, 0).setVelocity(Phaser.Math.Between(5, 30), 0);
    }
    this.add.image(1024/2, 255, 'textures', 'Title_Logo');
    let btn_config = this.add.image(1024/4, 600, 'textures', 'Btn_Config');
    let btn_start = this.add.image(1024/4 * 3, 600, 'textures', 'Btn_Start');

    btn_config.setInteractive();
    btn_config.on('pointerdown', () => {
      if(!isAnyModalActive()) {
        showModal('dialog-config');
      }
    });

    btn_start.setInteractive();
    btn_start.on('pointerdown', () => {
      if(!isAnyModalActive()) {
        loadConfig();
        this.scene.start('Main');
      }
    });
  }
  
  update(time, delta) {
    const clouds = this.clouds.getChildren();
    for(let i = 0; i < clouds.length; i++) {
      if(clouds[i].x >= 1024) {
        clouds[i].setX(clouds[i].width * -1);
        clouds[i].setY(Phaser.Math.Between(0, 704));
      }
    }
  }
}