class BootScene extends Phaser.Scene {
 
  constructor() {
    super('Boot');
  }

  preload() {
    for (let prop in CST.IMAGES) {
      this.load.image(prop, CST.IMAGES[prop]);
    }
  
    for (let prop in CST.AUDIO) {
      this.load.audio(prop, CST.AUDIO[prop]);
    }

    this.load.obj('dice_obj', 'images/dice.obj');
    this.load.spritesheet('objects', 'images/objects.png', { frameWidth: 64, frameHeight: 64 });
    this.load.atlas('textures', 'images/textures.png', 'images/textures.json')
    this.load.tilemapTiledJSON('stage1', 'maps/stage1.json');
    this.load.tilemapTiledJSON('stage2', 'maps/stage2.json');
    this.load.tilemapTiledJSON('stage3', 'maps/stage3.json');
    this.load.tilemapTiledJSON('stage4', 'maps/stage4.json');
    this.load.tilemapTiledJSON('stage5', 'maps/stage5.json');
    this.load.tilemapTiledJSON('demo', 'map/demo.json');
  }
  
  create() {
    this.textures.addSpriteSheetFromAtlas('Cat', { frameHeight: 64, frameWidth: 64, atlas: 'textures', frame: 'Cat' + '_Spritesheet' })
    this.textures.addSpriteSheetFromAtlas('Rabbit', { frameHeight: 64, frameWidth: 64, atlas: 'textures', frame: 'Rabbit' + '_Spritesheet' })
    this.textures.addSpriteSheetFromAtlas('Chick', { frameHeight: 64, frameWidth: 64, atlas: 'textures', frame: 'Chick' + '_Spritesheet' })
    this.textures.addSpriteSheetFromAtlas('Pig', { frameHeight: 64, frameWidth: 64, atlas: 'textures', frame: 'Pig' + '_Spritesheet' })

    this.scene.start('Title');
  }
}