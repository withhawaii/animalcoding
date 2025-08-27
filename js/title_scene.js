class TitleScene extends Phaser.Scene {
 
  constructor() {
    super("Title");
  }

  preload() {
    if(this.game.config.debug) {
      console.log("Debug mode enabled.");
    }

    for (let prop in CST.IMAGES) {
      this.load.image(prop, CST.IMAGES[prop]);
    }
  
    for (let prop in CST.AUDIO) {
      this.load.audio(prop, CST.AUDIO[prop]);
    }

    this.load.atlas("textures", "images/textures.png", "images/textures.json")
    this.load.spritesheet('objects', 'tilemap/objects.png', { frameWidth: 64, frameHeight: 64 });
  }
  
  create() {
    this.createBackground();
  }

  createBackground() {
    this.clouds = this.physics.add.group();
    for(let i = 0; i < 4; i++) {
      this.clouds.create(Phaser.Math.Between(0, 1024), Phaser.Math.Between(0, 704), 'textures',`Cloud_0${i + 1}`).setOrigin(0, 0).setVelocity(Phaser.Math.Between(5, 30), 0);
    }
    this.add.image(1024/2, 48, "textures", "UI_Logo_01");
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