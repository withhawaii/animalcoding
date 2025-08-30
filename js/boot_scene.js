class BootScene extends Phaser.Scene {
 
  constructor() {
    super('Boot');
  }

  preload() {
    this.config = JSON.parse(localStorage.getItem('config'));
    if(this.game.config.debug) {
      console.log('Debug mode enabled.');
    }

    for (let prop in CST.IMAGES) {
      this.load.image(prop, CST.IMAGES[prop]);
    }
  
    for (let prop in CST.AUDIO) {
      this.load.audio(prop, CST.AUDIO[prop]);
    }

    this.load.obj('dice_obj', 'images/dice.obj');
    this.load.atlas('textures', 'images/textures.png', 'images/textures.json')
    console.log(this.config['stage']);
    this.load.tilemapTiledJSON('map', 'tilemap/' + this.config['stage'] + '.json');
    this.load.spritesheet('objects', 'tilemap/objects.png', { frameWidth: 64, frameHeight: 64 });
  }
  
  create() {
    this.textures.addSpriteSheetFromAtlas('Cat', { frameHeight: 64, frameWidth: 64, atlas: 'textures', frame: 'Cat' + '_Spritesheet' })
    this.textures.addSpriteSheetFromAtlas('Rabbit', { frameHeight: 64, frameWidth: 64, atlas: 'textures', frame: 'Rabbit' + '_Spritesheet' })
    this.textures.addSpriteSheetFromAtlas('Chick', { frameHeight: 64, frameWidth: 64, atlas: 'textures', frame: 'Chick' + '_Spritesheet' })
    this.textures.addSpriteSheetFromAtlas('Pig', { frameHeight: 64, frameWidth: 64, atlas: 'textures', frame: 'Pig' + '_Spritesheet' })
   this.scene.start('Title');
  }
}