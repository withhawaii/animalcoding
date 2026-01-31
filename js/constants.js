const CST = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
  FALL: 4,
  TOWARDS_AHEAD: 0,
  TOWARDS_LEFT: -1,
  TOWARDS_RIGHT: 1,
  TRAP_ON: 17,
  TRAP_OFF: 18,
  COIN: 30,
  COIN_POINT: 1,
  RUBY: 32,
  RUBY_POINT: 5,
  CRYSTAL: 31,
  CRYSTAL_POINT: 10,
  STAR: 99,
  STAR_POINT: 10,
  CUCUMBER: 38,
  CUCUMBER_POINT: 3,
  CARROT: 36,
  CARROT_POINT: 5,
  TOMATO: 37,
  TOMATO_POINT: 10,
  TITLE_MESSAGE: "This is a turn-based multiplayer game designed to introduce basic text-based programming concepts.\n\nYou can play with up to 4 players. Click 'Config' and enter the player names. Leave any name blank if you want to play with fewer than 4 players.\n\nWhen you’re ready, press 'Start' to begin the game. \n\nHave fun coding your way through the adventure!",
}

const AUDIO = {
  move: 'audio/move.mp3',
  turnLimit: 'audio/turn.mp3',
  stuck: 'audio/stuck.mp3',
  charged: 'audio/powerup.mp3',
  hangup: 'audio/freeze.mp3',
  pickup: 'audio/pickup.mp3',
  star: 'audio/star.mp3',
  cracker: 'audio/cracker.mp3',
  trap: 'audio/trap.mp3',
  disarm: 'audio/disarm.mp3',
  firework: 'audio/firework.mp3',
  intro: 'audio/jingle_01.mp3',
  result: 'audio/jingle_02.mp3',
  final: 'audio/jingle_03.mp3',
  double: 'audio/jingle_04.mp3',
  bgm_01: 'audio/bgm_01.wav',
  bgm_02: 'audio/bgm_02.wav',
}

const SNIPPETS = {
  move_forward: {
    caption: 'move_forward();',
    value: 'move_forward();\n',
    help: 'Move a character \none step forward'
  },
  turn_left: {
    caption: 'turn_left();',
    value: 'turn_left();\n',
    help: 'Rotate a character \ntowards left 90 degree'
  },
  turn_right: {
    caption: 'turn_right();',
    value: 'turn_right();\n',
    help: 'Rotate a character \ntowards right 90 degree'
  },  
  pick_up: {
    caption: 'pick_up();',
    value: 'pick_up();\n',
    help: 'Pick up an item \non the ground'
  },
  eat: {
    caption: 'eat();',
    value: 'eat();\n',
    help: 'Eat a food item \non the ground'
  },
  steal: {
    caption: 'steal();',
    value: 'steal();\n',
    help: 'Steal an item \nfrom other players'
  },
  stop_trap: {
    caption: 'stop_trap();',
    value: 'stop_trap();\n',
    help: 'Temporarily stop a trap \nin front of a player'
  },
  function: {
    caption: 'function() my_command()...',
    value: "function my_command() {\n\t$1\n}\n",
    help: 'Give a name to \na block of commands \nfor later use'
  },
  for: {
    caption: 'for(i = 0; i < 10; i++)...',
    value: "for(i = 0; i < 10; i++){\n\t$1\n}\n",
    help: 'Repeat a block of commands \nmultiple times'
  },
  if_trap_is_on: {
    caption: 'if(trap_is_on)...',
    value: "if(trap_is_on) {\n\t$1\n} else {\n\t$2\n}\n",
    help: 'Run a block of commands \nwhen the trap in front of \nthe character is on'
  },
  if_path_ahead: {
    caption: 'if(path_ahead)...',
    value: "if(path_ahead) {\n\t$1\n} else {\n\t$2\n}\n",
    help: 'Run a block of commands \nwhen there is no obstruct \nin front of the character'
  },
  if_path_to_the_left: {
    caption: 'if(path_to_the_left)...',
    value: "if(path_to_the_left) {\n\t$1\n} else {\n\t$2\n}\n",
    help: 'Run a block of commands \nwhen there is no obstruct \non the left side of the character'
  },
  if_path_to_the_right: {
    caption: 'if(path_to_the_right)...',
    value: "if(path_to_the_right) {\n\t$1\n} else {\n\t$2\n}\n",
    help: 'Run a block of commands \nwhen there is no obstruct \non the right side of the character'
  },
}

const STAGE_CONFIG = {
  stage1: {
    name: 'Stage 1',
    map: 'maps/stage1.json',
    turnLimit: 8,
    double: [3, 6], 
    next: 'stage2',
    bgm: 'bgm_01',
    video: '1fQvqWQ6-Ikxbh49Ld0OHMQUSmdB6vLcd',
    snippets: [
      SNIPPETS['move_forward'],
      SNIPPETS['turn_left'],
      SNIPPETS['turn_right'],
      SNIPPETS['pick_up'],
      SNIPPETS['eat'],
    ]
  },  
  stage2: {
    name: 'Stage 2',
    map: 'maps/stage2.json',
    turnLimit: 8,
    double: [3, 6], 
    next: 'stage3',
    bgm: 'bgm_02',
    video: '1ACKeEMbZBtQi6eqqyRxzJzFVqCHM6QLe',
    snippets: [
      SNIPPETS['move_forward'],
      SNIPPETS['turn_left'],
      SNIPPETS['turn_right'],
      SNIPPETS['pick_up'],
      SNIPPETS['eat'],
      SNIPPETS['for'],
    ]
  }, 
  stage3: {
    name: 'Stage 3',
    map: 'maps/stage3.json',
    turnLimit: 4,
    double: [], 
    next: 'stage4',
    bgm: 'bgm_01',
    video: '1A0mIB4oj_kbIPgMZwQ0PipQlTr3xda7y',
    snippets: [
      SNIPPETS['move_forward'],
      SNIPPETS['turn_left'],
      SNIPPETS['turn_right'],
      SNIPPETS['pick_up'],
      SNIPPETS['eat'],
      SNIPPETS['for'],
      SNIPPETS['if_path_ahead'],
      SNIPPETS['if_path_to_the_left'],
      SNIPPETS['if_path_to_the_right'],
    ]
  }, 
  stage4: {
    name: 'Stage 4',
    map: 'maps/stage4.json',
    turnLimit: 8,
    double: [3, 6], 
    next: 'stage5',
    bgm: 'bgm_02',
    video: '1XqhmvNox_isWE2Wzl9BQJ-ofTi-b7qi7',
    snippets: [
      SNIPPETS['move_forward'],
      SNIPPETS['turn_left'],
      SNIPPETS['turn_right'],
      SNIPPETS['pick_up'],
      SNIPPETS['eat'],
      SNIPPETS['for'],
      SNIPPETS['if_path_ahead'],
      SNIPPETS['if_path_to_the_left'],
      SNIPPETS['if_path_to_the_right'],
      SNIPPETS['function'],
    ]
  }, 
  stage5: {
    name: 'Stage 5',
    map: 'maps/stage5.json',
    turnLimit: 16,
    double: [3, 6, 9, 12],       
    next: null,
    bgm: 'bgm_01',
    video: '1RcqiZIGqNvvDyQmFckxgE-g1G_-NCXrG',
    snippets: [
      SNIPPETS['move_forward'],
      SNIPPETS['turn_left'],
      SNIPPETS['turn_right'],
      SNIPPETS['pick_up'],
      SNIPPETS['eat'],
      SNIPPETS['steal'],
      SNIPPETS['stop_trap'],
      SNIPPETS['for'],
      SNIPPETS['if_path_ahead'],
      SNIPPETS['if_path_to_the_left'],
      SNIPPETS['if_path_to_the_right'],
      SNIPPETS['if_trap_is_on'],
      SNIPPETS['function'],
    ]
  },
  demo: {
    name: 'Demo',
    map: 'maps/demo.json',
    turnLimit: 4,
    double: [], 
    next: null,
    bgm: 'bgm_02',
    snippets: [
      SNIPPETS['move_forward'],
      SNIPPETS['turn_left'],
      SNIPPETS['turn_right'],
      SNIPPETS['pick_up'],
      SNIPPETS['eat'],
      SNIPPETS['steal'],
      SNIPPETS['stop_trap'],
      SNIPPETS['for'],
      SNIPPETS['if_path_ahead'],
      SNIPPETS['if_path_to_the_left'],
      SNIPPETS['if_path_to_the_right'],
      SNIPPETS['if_trap_is_on'],
      SNIPPETS['function'],
    ]
  }  
}
