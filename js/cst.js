const CST = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,

  COIN_POINT: 1,
  RUBY_POINT: 5,
  CRYSTAL_POINT: 10,

  IMAGES: {
    dice_albedo: 'images/dice-albedo.png',
    ground: 'tilemap/ground.png',
  },
  
  AUDIO: {
    move: 'audio/move.mp3',
    turn: 'audio/turn.mp3',
    stuck: 'audio/stuck.mp3',
    charged: 'audio/powerup.mp3',
    hangup: 'audio/freeze.mp3',
    pickup: 'audio/pickup.mp3',
    intro: 'audio/jingle_01.mp3',
    result: 'audio/jingle_02.mp3',
    bgm_01: 'audio/bgm_01.wav',
  },

  TINTS: [
    0xff4136,
    0xff851b,
    0xffdc00,
    0x01ff70,
    0x2ecc40,
    0x7fdbff,
    0x0074d9,
    0xf012be,
    0xb10dc9
  ],

  STAGE_CONFIG: {
    stage1: {
      name: 'Stage 1',
      next: 'stage2',
      snippets: [
        ["move_forward();", "move_forward()"], 
        ["turn_left();", "turn_left()"],
        ["turn_right();", "turn_right()"], 
        ["pick_up();", "pick_up()"],
        ["take();", "take()"],
      ]
    },  
    stage2: {
      name: 'Stage 2',
      next: 'stage3',
    }, 
    stage3: {
      name: 'Stage 3',
      next: 'stage4',
    }, 
    stage4: {
      name: 'Stage 4',
      next: 'stage4',
    }, 
    stage5: {
      name: 'Stage 5',
      next: null,
    },
    demo: {
      name: 'Demo',
      next: null,
      snippets: [
        ["move_forward();", "move_forward()"], 
        ["turn_left();", "turn_left()"],
        ["turn_right();", "turn_right()"], 
        ["pick_up();", "pick_up()"],
        ["take();", "take()"],
      ]
    },
  },

  SNIPPETS: {
    demo: [
      ["move_forward();", "move_forward()"], 
      ["turn_left();", "turn_left()"],
      ["turn_right();", "turn_right()"], 
      ["pick_up();", "pick_up()"],
      ["take();", "take()"],
    ],
    stage1: [
      ["move_forward();", "move_forward()"], 
      ["turn_left();", "turn_left()"],
      ["turn_right();", "turn_right()"], 
      ["pick_up();", "pick_up()"],
    ]
  }
}
   