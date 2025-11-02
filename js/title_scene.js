class TitleScene extends Phaser.Scene {
 
  constructor() {
    super('Title');
  }
  
  create() {
    this.createBackground();
    ui.insertText('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum molestie, neque id ultricies interdum, nisl ante suscipit lectus, at scelerisque risus tortor id massa. Mauris sollicitudin, ligula eu sagittis venenatis, lacus eros tempor erat, at pharetra metus ex ut ante. In hac habitasse platea dictumst. Pellentesque fringilla ultrices elementum. Sed pharetra ultrices odio, vitae pellentesque risus tincidunt eu. In sed luctus turpis, tincidunt dictum diam. Sed accumsan eros est, ut bibendum enim mollis blandit. Nulla cursus justo at odio volutpat, in accumsan velit porta. Etiam tincidunt suscipit justo, a sodales augue fringilla vel. Donec vulputate risus ex, sit amet imperdiet ante luctus nec. Nullam lacinia in nisl vitae laoreet. Nulla facilisi.');
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
        this.game.config.shuffle = config.shuffle == 'Y' ? true : false;
        this.game.config.debug = config.debug == 'Y' ? true : false;
        ui.log('Config loaded:',  ui.game.config);
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