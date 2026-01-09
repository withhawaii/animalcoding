class Item extends Phaser.GameObjects.Container {
  constructor(scene, x, y, texture, index, offset, depth, initialCount = null) {
    super(scene, x, y);
    this.image = scene.add.image(0, 0, texture, index - offset).setOrigin(0, 0.5);
    this.index = index;
    this.count = initialCount;
    this.countText = scene.add.text(48, 12, initialCount, {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        backgroundColor: '#000000aa', // Slight background for readability
        padding: { x: 2, y: 2 }
    }).setOrigin(0, 0);
    this.add(this.image);
    this.add(this.countText);
    this.scene.add.existing(this);
    this.setDepth(depth);

    if(this.isCollectible()) {
      this.image.postFX.addShine(Phaser.Math.FloatBetween(0.1, 0.5));
    }

    if(initialCount) {
      this.setCount(this.count)
    }
    else if([CST.CUCUMBER, CST.CARROT].includes(this.index)) {
      this.setCount(Phaser.Utils.Array.GetRandom([1, 1, 1, 2, 2, 3]));
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
}