class BootScene extends Phaser.Scene {
 
  constructor() {
    super('Boot');
  }

  preload() {  
    for (let prop in AUDIO) {
      this.load.audio(prop, AUDIO[prop]);
    }

    for (let stage in STAGE_CONFIG) {
      this.load.tilemapTiledJSON(stage, STAGE_CONFIG[stage].map);
    }

    this.load.atlas('textures', 'images/textures.png', 'images/textures.json')
    this.load.obj('dice_obj', 'images/dice.obj');
    this.load.image('dice_albedo', 'images/dice-albedo.png');
    this.load.image('ground', 'maps/ground.png');
    this.load.spritesheet('objects', 'maps/objects.png', { frameWidth: 64, frameHeight: 64 });
  }
  
  create() {
    this.textures.addSpriteSheetFromAtlas('Cat', { frameHeight: 64, frameWidth: 64, atlas: 'textures', frame: 'Cat_Spritesheet' })
    this.textures.addSpriteSheetFromAtlas('Rabbit', { frameHeight: 64, frameWidth: 64, atlas: 'textures', frame: 'Rabbit_Spritesheet' })
    this.textures.addSpriteSheetFromAtlas('Chick', { frameHeight: 64, frameWidth: 64, atlas: 'textures', frame: 'Chick_Spritesheet' })
    this.textures.addSpriteSheetFromAtlas('Pig', { frameHeight: 64, frameWidth: 64, atlas: 'textures', frame: 'Pig_Spritesheet' })
    this.textures.generate('rocket', {
      data: ['0123...'],
      palette: {
        0: '#fff2',
        1: '#fff4',
        2: '#fff8',
        3: '#ffff'
      },
      pixelWidth: 4
    });
    const stars = this.textures.createCanvas('stars', 1024, 768);
    const ctx = stars.getContext();
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, 1024, 768);
    ctx.fillStyle = '#ffffff';
    let i = 1024;
    while (i-- > 0) {
      ctx.globalAlpha = Phaser.Math.FloatBetween(0, 1);
      ctx.fillRect(Phaser.Math.Between(0, 1023), Phaser.Math.Between(0, 767), 1, 1);
    }
    stars.refresh();
    this.scene.start('Title');
  }
}