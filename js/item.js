class Item extends Phaser.GameObjects.Container {
  constructor(scene, x, y, texture, index, offset, initialCount = null, player = null) {
    super(scene, x, y);
    this.image = scene.add.image(0, 0, texture, index - offset).setOrigin(0, 0.5);
    this.index = index;
    const grid = this.scene.ground.getTileAtWorldXY(x, y, true);
    this.xGrid = grid.x;
    this.yGrid = grid.y;
    this.player = player;
    this.count = initialCount;
    this.countText = scene.add.text(48, 12, initialCount, {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        backgroundColor: '#000000aa',
        padding: { x: 2, y: 2 }
    }).setOrigin(0, 0);
    this.helperText = scene.add.text(0, 0, this.getHelperText(index), {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 5, y: 5 }
    });
    this.helperText.setOrigin(0.5);
    this.helperText.setVisible(false);
//    this.helperText.setDepth(100);
    this.setSize(this.image.width, this.image.height);
    this.image.setInteractive();
    this.bindEvents();
    this.add(this.image);
    this.add(this.countText);
    this.add(this.helperText);
    this.scene.add.existing(this);
    this.setDepth(this.yGrid);

    if(this.isCollectible()) {
      this.image.postFX.addShine(Phaser.Math.FloatBetween(0.1, 0.5));
    }

    if(initialCount) {
      this.setCount(this.count)
    }
    else {
      this.setCount(1);
    }
  }

  isCollectible() {
    return([CST.COIN, CST.RUBY, CST.CRYSTAL].includes(this.index))
  }

  isFood() {
    return([CST.CUCUMBER, CST.CARROT, CST.TOMATO].includes(this.index))
  }

  setCount(value) {
    this.count = value;
    this.countText.setText(this.count);
 
    if(this.count <= 1) {
      this.countText.setVisible(false);
    }
    else {
      this.countText.setVisible(true);
      this.scene.tweens.add({
        targets: this.countText,
        scale: 1.2,
        duration: 100,
        yoyo: true
      });
    }

    if(this.count <= 0) {
      this.image.setVisible(false);
    }
    else {
      this.image.setVisible(true);
    }
  }

  bindEvents() {
    this.image.on('pointerover', (pointer) => {
      this.helperText.setVisible(true);
      this.helperText.x = pointer.x - this.x;
      this.helperText.y = pointer.y - this.y - 30;
    });

    this.image.on('pointerout', () => {
      this.helperText.setVisible(false);
    });
    
    this.image.on('pointermove', (pointer) => {
      this.helperText.x = pointer.x - this.x;
      this.helperText.y = pointer.y - this.y - 30;
    });
  }
  
  getHelperText(index) {
    if(index === CST.COIN) {
      return(`Coin: ${CST.COIN_POINT} pt`);
    }
    else if(index === CST.RUBY) {
      return(`Ruby: ${CST.RUBY_POINT} pts`);
    }
    else if(index === CST.CRYSTAL) {
      return(`Crystal: ${CST.CRYSTAL_POINT} pts`);      
    }
    else if(index === CST.CUCUMBER) {
      return(`Cucumber: ${CST.CUCUMBER_POINT} ap`);      
    }
    else if(index === CST.CARROT) {
      return(`Carrot: ${CST.CARROT_POINT} ap`);            
    }
    else if(index === CST.TOMATO) {
      return(`Tomato: ${CST.TOMATO_POINT} ap`);            
    }
  }
}