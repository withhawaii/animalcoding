class Dice {
 
  constructor(x, y, scene, duration = 1000) {
    this.x = x;
    this.y = y;
    this.scene = scene;
    this.duration = 1000;
    this.diceIsRolling = false;

    this.dice = scene.add.mesh(x, y, "dice-albedo");
    this.shadowFX = this.dice.postFX.addShadow(0, 0, 0.006, 2, 0x111111, 10, .8);

    this.dice.addVerticesFromObj("dice-obj", 0.25);
    this.dice.panZ(6);

    this.dice.modelRotation.x = Phaser.Math.DegToRad(0);
    this.dice.modelRotation.y = Phaser.Math.DegToRad(-90);

        // Text object to show the dice value
    this.textDiceValue = this.scene.add.text(this.scene.scale.width / 2, this.scene.scale.height / 2, '0', { fontFamily: 'Arial Black', fontSize: 74, color: '#c51b7d' });
    this.textDiceValue.setStroke('#de77ae', 16).setScale(0);
  }

  roll() {
    var dice = this.dice;
    var duration = this.duration;
    var shadowFX = this.shadowFX;
    var scene = this.scene;
    var diceRoll;
    if (!this.diceIsRolling) {
        this.diceIsRolling = true;
        diceRoll = Phaser.Math.Between(1, 6);

        // Shadow
        this.scene.add.tween({
            targets: shadowFX,
            x: -8,
            y: 10,
            duration: duration -250,
            ease: "Sine.easeInOut",
            yoyo: true,
        });

        this.scene.add.tween({
            targets: dice,
            from: 0,
            to: 1,
            duration: this.duration,
            onUpdate: () => {
                dice.modelRotation.x -= .02;
                dice.modelRotation.y -= .08;
            },
            onComplete: () => {
                switch (diceRoll) {
                    case 1:
                        dice.modelRotation.x = Phaser.Math.DegToRad(0);
                        dice.modelRotation.y = Phaser.Math.DegToRad(-90);
                        break;
                    case 2:
                        dice.modelRotation.x = Phaser.Math.DegToRad(90);
                        dice.modelRotation.y = Phaser.Math.DegToRad(0);
                        break;
                    case 3:
                        dice.modelRotation.x = Phaser.Math.DegToRad(180);
                        dice.modelRotation.y = Phaser.Math.DegToRad(0);
                        break;
                    case 4:
                        dice.modelRotation.x = Phaser.Math.DegToRad(180);
                        dice.modelRotation.y = Phaser.Math.DegToRad(180);
                        break;
                    case 5:
                        dice.modelRotation.x = Phaser.Math.DegToRad(-90);
                        dice.modelRotation.y = Phaser.Math.DegToRad(0);
                        break;
                    case 6:
                        dice.modelRotation.x = Phaser.Math.DegToRad(0);
                        dice.modelRotation.y = Phaser.Math.DegToRad(90);
                        break;
                }
            },
            ease: "Sine.easeInOut",
        });

        // Intro dice
        scene.add.tween({
            targets: [dice],
            scale: 1.2,
            duration: duration - 200,
            yoyo: true,
            ease: Phaser.Math.Easing.Quadratic.InOut,
            onComplete: () => {
                dice.scale = 1;
                this.diceIsRolling = false;
  
                // Show the dice value
                this.textDiceValue.text = diceRoll;
                this.textDiceValue.setOrigin(0.5);
                this.textDiceValue.setPosition(scene.scale.width / 2, scene.scale.height / 2);

                scene.add.tween({
                    targets: this.textDiceValue,
                    scale: 1,
                    duration: 1000,
                    ease: Phaser.Math.Easing.Bounce.Out,
                    onComplete: () => {
                        scene.add.tween({
                            targets: [this.textDiceValue],
                            scale: 0,
                            delay: 1000,
                            duration: 1000,
                            ease: Phaser.Math.Easing.Bounce.Out,
                        });
                    }
                });
            }
        });
    } else {
        console.log("Is rolling");
    }
    return diceRoll;
  }
}  