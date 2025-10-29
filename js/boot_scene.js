class BootScene extends Phaser.Scene {
 
  constructor() {
    super('Boot');
  }

  preload() {  
    for (let prop in CST.AUDIO) {
      this.load.audio(prop, CST.AUDIO[prop]);
    }

    for (let stage in CST.STAGE_CONFIG) {
      this.load.tilemapTiledJSON(stage, CST.STAGE_CONFIG[stage].map);
    }

    this.load.atlas('textures', 'images/textures.png', 'images/textures.json')
    this.load.obj('dice_obj', 'images/dice.obj');
    this.load.image('dice_albedo', 'images/dice-albedo.png');
    this.load.image('ground', 'images/ground.png');
    this.load.spritesheet('objects', 'images/objects.png', { frameWidth: 64, frameHeight: 64 });
  }
  
  create() {
    this.textures.addSpriteSheetFromAtlas('Cat', { frameHeight: 64, frameWidth: 64, atlas: 'textures', frame: 'Cat_Spritesheet' })
    this.textures.addSpriteSheetFromAtlas('Rabbit', { frameHeight: 64, frameWidth: 64, atlas: 'textures', frame: 'Rabbit_Spritesheet' })
    this.textures.addSpriteSheetFromAtlas('Chick', { frameHeight: 64, frameWidth: 64, atlas: 'textures', frame: 'Chick_Spritesheet' })
    this.textures.addSpriteSheetFromAtlas('Pig', { frameHeight: 64, frameWidth: 64, atlas: 'textures', frame: 'Pig_Spritesheet' })

    this.scene.start('Title');
  }
}