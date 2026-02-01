class TitleScene extends Phaser.Scene {
 
  constructor() {
    super('Title');
  }
  
  create() {
    this.createBackground();
    this.add.image(1024/2, 255, 'textures', 'Title_Logo');
    let btn_config = this.add.image(1024/4, 600, 'textures', 'Btn_Config');
    let btn_start = this.add.image(1024/4 * 3, 600, 'textures', 'Btn_Start');

    btn_config.setInteractive();
    btn_config.on('pointerdown', () => {
      if(!ui.isAnyModalActive()) {
        ui.showModal('dialog-config');
      }
    });

    btn_start.setInteractive();
    btn_start.on('pointerdown', () => {
      if(!ui.isAnyModalActive()) {
        const config = JSON.parse(localStorage.getItem('config'));
        for (const key in config) {
          this.game.config[key] = config[key];
        }
        this.game.config.shuffle = config.shuffle === 'Y' ? true : false;
        this.game.config.debug = config.debug === 'Y' ? true : false;
        ui.log('Config loaded:',  ui.game.config);
        this.scene.start('Main');
      }
    });
    ui.insertText("This is a turn-based multiplayer game designed to introduce basic text-based programming concepts.\n\nYou can play with up to 4 players. Click 'Config' and enter the player names. Leave any name blank if you want to play with fewer than 4 players.\n\nWhen you’re ready, press 'Start' to begin the game. \n\nHave fun coding your way through the adventure!");
    ui.disableButton('btn_run_code');
    ui.disableButton('btn_skip');
    ui.disableButton('btn_help');
  }

  createBackground() {
    this.clouds = this.physics.add.group();
    for(let i = 0; i < 4; i++) {
      this.clouds.create(Phaser.Math.Between(0, 1024), Phaser.Math.Between(0, 704), 'textures',`Cloud_0${i + 1}`).setOrigin(0, 0).setVelocity(Phaser.Math.Between(5, 30), 0);
    }
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