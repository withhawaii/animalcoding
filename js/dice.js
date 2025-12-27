class Dice extends Phaser.GameObjects.Container {
 
  constructor(scene, x, y, duration = 1000) {
    super(scene);
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.duration = duration;
    this.diceIsRolling = false;
    this.setDepth(20);
    this.setSize(150, 150);
    this.setInteractive();

    this.dice = this.scene.add.mesh(0, 0, 'dice_albedo');
    this.dice.addVerticesFromObj('dice_obj', 0.25);
    this.dice.panZ(6);
    this.dice.modelRotation.x = Phaser.Math.DegToRad(0);
    this.dice.modelRotation.y = Phaser.Math.DegToRad(-90);
    this.shadowFX = this.dice.postFX.addShadow(0, 0, 0.006, 2, 0x111111, 10, .8);

    this.textDiceValue = this.scene.add.text(0, 0, '0', { fontFamily: 'Arial Black', fontSize: 74, color: '#c51b7d' });
    this.textDiceValue.setOrigin(0.5);
    this.textDiceValue.setStroke('#de77ae', 16).setScale(0);

    this.add(this.dice);
    this.add(this.textDiceValue);
    this.scene.add.existing(this);
  }

  isReadyToRoll() {
    return this.dice.visible && !this.diceIsRolling;
  }
   
  show() {
    this.dice.setVisible(true);
    this.scene.add.tween({
        targets: this.dice.modelRotation,
        x: { from: -0.1, to: 0.1},
        y: { from: -0.1, to: 0.1},
        duration: this.duration,
        repeat: -1,
        yoyo: true,        
        ease: 'Sine.easeInOut',
    });
  }

  hide() {
    this.dice.setVisible(false);
  }

  roll(callback) {
    if (!this.diceIsRolling) {
        this.diceIsRolling = true;
        this.scene.tweens.killTweensOf(this.dice.modelRotation);        
        let diceRoll;
        if(this.scene.game.config.debug) {
          diceRoll = 6;
        }
        else {
          diceRoll = Phaser.Math.Between(1, 6);
        }

        // Shadow
        this.scene.add.tween({
            targets: this.shadowFX,
            x: -8,
            y: 10,
            duration: this.duration - 250,
            ease: 'Sine.easeInOut',
            yoyo: true,
        });

        this.scene.add.tween({
            targets: this.dice,
            from: 0,
            to: 1,
            duration: this.duration,
            onUpdate: () => {
                this.dice.modelRotation.x -= .02;
                this.dice.modelRotation.y -= .08;
            },
            onComplete: () => {
                switch (diceRoll) {
                    case 1:
                        this.dice.modelRotation.x = Phaser.Math.DegToRad(0);
                        this.dice.modelRotation.y = Phaser.Math.DegToRad(-90);
                        break;
                    case 2:
                        this.dice.modelRotation.x = Phaser.Math.DegToRad(90);
                        this.dice.modelRotation.y = Phaser.Math.DegToRad(0);
                        break;
                    case 3:
                        this.dice.modelRotation.x = Phaser.Math.DegToRad(180);
                        this.dice.modelRotation.y = Phaser.Math.DegToRad(0);
                        break;
                    case 4:
                        this.dice.modelRotation.x = Phaser.Math.DegToRad(180);
                        this.dice.modelRotation.y = Phaser.Math.DegToRad(180);
                        break;
                    case 5:
                        this.dice.modelRotation.x = Phaser.Math.DegToRad(-90);
                        this.dice.modelRotation.y = Phaser.Math.DegToRad(0);
                        break;
                    case 6:
                        this.dice.modelRotation.x = Phaser.Math.DegToRad(0);
                        this.dice.modelRotation.y = Phaser.Math.DegToRad(90);
                        break;
                }
            },
            ease: 'Sine.easeInOut',
        });

        // Intro dice
        this.scene.add.tween({
            targets: [this.dice],
            scale: 1.2,
            duration: this.duration - 200,
            yoyo: true,
            ease: Phaser.Math.Easing.Quadratic.InOut,
            onComplete: () => {
                this.dice.scale = 1;
  
                // Show the dice value
                this.textDiceValue.text = diceRoll;
//                this.textDiceValue.setPosition(this.scene.scale.width / 2, this.scene.scale.height / 2);
                this.scene.add.tween({
                    targets: this.textDiceValue,
                    scale: 1,
                    duration: 1000,
                    ease: Phaser.Math.Easing.Bounce.Out,
                    onComplete: () => {
                        this.scene.add.tween({
                            targets: [this.textDiceValue],
                            scale: 0,
                            delay: 1000,
                            duration: 1000,
                            ease: Phaser.Math.Easing.Bounce.Out,
                            onComplete: () => {
                              callback(diceRoll);
                              this.diceIsRolling = false;
                            }
                        });
                    }
                });
            }
        });
    } else {
        console.log('Is rolling');
    }
  }
}  