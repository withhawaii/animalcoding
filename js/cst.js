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
  function: {
    caption: 'function() my_command()...',
    value: "function my_command() {\n  \n}\n",
    help: 'Give a name to \na block of commands \nfor later use'
  },
  for: {
    caption: 'for(i = 0; i < 10; i++)...',
    value: "for(i = 0; i < 10; i++){\n  \n}\n",
    help: 'Repeat a block of commands \nmultiple times'
  },
  if_trap_is_on: {
    caption: 'if(trap_is_on)...',
    value: "if(trap_is_on) {\n  \n} else {\n  \n}\n",
    help: 'Run a block of commands \nwhen the trap in front of \nthe character is on'
  },
  if_path_ahead: {
    caption: 'if(path_ahead)...',
    value: "if(path_ahead) {\n  \n} else {\n  \n}\n",
    help: 'Run a block of commands \nwhen there is no obstruct \nin front of the character'
  },
}

const CST = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
  FALL: 4,
  TRAP_ON: 17,
  TRAP_OFF: 18,
  COIN: 30,
  RUBY: 32,
  CRYSTAL: 31,
  COIN_POINT: 1,
  RUBY_POINT: 5,
  CRYSTAL_POINT: 10,
  CUCUMBER: 38,
  CARROT: 36,
  TOMATO: 37,
  CUCUMBER_POINT: 3,
  CARROT_POINT: 5,
  TOMATO_POINT: 10,
  TITLE_MESSAGE: "This is a turn-based multiplayer game designed to introduce basic text-based programming concepts.\n\nYou can play with up to 4 players. Click 'Config' and enter the player names. Leave any name blank if you want to play with fewer than 4 players.\n\nWhen you’re ready, press 'Start' to begin the game. \n\nHave fun coding your way through the adventure!",

  AUDIO: {
    move: 'audio/move.mp3',
    turn: 'audio/turn.mp3',
    stuck: 'audio/stuck.mp3',
    charged: 'audio/powerup.mp3',
    hangup: 'audio/freeze.mp3',
    pickup: 'audio/pickup.mp3',
    trap: 'audio/trap.mp3',
    disarm: 'audio/disarm.mp3',
    intro: 'audio/jingle_01.mp3',
    result: 'audio/jingle_02.mp3',
    final: 'audio/jingle_03.mp3',
    double: 'audio/jingle_04.mp3',
    bgm_01: 'audio/bgm_01.wav',
    bgm_02: 'audio/bgm_02.wav',
  },

  STAGE_CONFIG: {
    stage1: {
      name: 'Stage 1',
      map: 'maps/stage1.json',
      turn: 20,
      double: [5, 10, 15, 20], 
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
      turn: 20,
      double: [5, 10, 15, 20],     
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
      turn: 20,
      double: [5, 10, 15, 20],      
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
        SNIPPETS['if_trap_is_on'],
        SNIPPETS['if_path_ahead'],
      ]
    }, 
    stage4: {
      name: 'Stage 4',
      map: 'maps/stage4.json',
      turn: 20,
      double: [5, 10, 15, 20],       
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
        SNIPPETS['if_trap_is_on'],
        SNIPPETS['if_path_ahead'],
        SNIPPETS['function'],
      ]
    }, 
    stage5: {
      name: 'Stage 5',
      map: 'maps/stage5.json',
      turn: 20,
      double: [5, 10, 15, 20],       
      next: null,
      bgm: 'bgm_01',
      video: '1RcqiZIGqNvvDyQmFckxgE-g1G_-NCXrG',
      snippets: [
        SNIPPETS['move_forward'],
        SNIPPETS['turn_left'],
        SNIPPETS['turn_right'],
        SNIPPETS['pick_up'],
        SNIPPETS['eat'],
        SNIPPETS['for'],
        SNIPPETS['if_trap_is_on'],
        SNIPPETS['if_path_ahead'],
        SNIPPETS['function'],
      ]
    },
    demo: {
      name: 'Demo',
      map: 'maps/demo.json',
      turn: 2,
      double: [2], 
      next: null,
      bgm: 'bgm_02',
      snippets: [
        SNIPPETS['move_forward'],
        SNIPPETS['turn_left'],
        SNIPPETS['turn_right'],
        SNIPPETS['pick_up'],
        SNIPPETS['eat'],
        SNIPPETS['steal'],
        SNIPPETS['function'],
        SNIPPETS['for'],
        SNIPPETS['if_trap_is_on'],
        SNIPPETS['if_path_ahead'],
      ]
    },
  },

  EDITOR_CONFIG: {
    selectionStyle: 'line',// 'line'|'text'
    highlightActiveLine: true, // boolean
    highlightSelectedWord: true, // boolean
    readOnly: false, // boolean: true if read only
    cursorStyle: 'ace', // 'ace'|'slim'|'smooth'|'wide'
    mergeUndoDeltas: true, // false|true|'always'
    behavioursEnabled: true, // boolean: true if enable custom behaviours
    wrapBehavioursEnabled: true, // boolean
    autoScrollEditorIntoView: undefined, // boolean: this is needed if editor is inside scrollable page
    keyboardHandler: null, // function: handle custom keyboard events
    
    // renderer options
    animatedScroll: false, // boolean: true if scroll should be animated
    displayIndentGuides: false, // boolean: true if the indent should be shown. See 'showInvisibles'
    showInvisibles: true, // boolean -> displayIndentGuides: true if show the invisible tabs/spaces in indents
    showPrintMargin: true, // boolean: true if show the vertical print margin
    printMarginColumn: 80, // number: number of columns for vertical print margin
    printMargin: undefined, // boolean | number: showPrintMargin | printMarginColumn
    showGutter: true, // boolean: true if show line gutter
    fadeFoldWidgets: false, // boolean: true if the fold lines should be faded
    showFoldWidgets: true, // boolean: true if the fold lines should be shown ?
    showLineNumbers: true,
    highlightGutterLine: false, // boolean: true if the gutter line should be highlighted
    hScrollBarAlwaysVisible: false, // boolean: true if the horizontal scroll bar should be shown regardless
    vScrollBarAlwaysVisible: false, // boolean: true if the vertical scroll bar should be shown regardless
    fontSize: 14, // number | string: set the font size to this many pixels
    fontFamily: undefined, // string: set the font-family css value
    maxLines: undefined, // number: set the maximum lines possible. This will make the editor height changes
    minLines: undefined, // number: set the minimum lines possible. This will make the editor height changes
    maxPixelHeight: 0, // number -> maxLines: set the maximum height in pixel, when 'maxLines' is defined. 
    scrollPastEnd: 0, // number -> !maxLines: if positive, user can scroll pass the last line and go n * editorHeight more distance 
    fixedWidthGutter: false, // boolean: true if the gutter should be fixed width

    // mouseHandler options
    scrollSpeed: 2, // number: the scroll speed index
    dragDelay: 0, // number: the drag delay before drag starts. it's 150ms for mac by default 
    dragEnabled: true, // boolean: enable dragging
    tooltipFollowsMouse: true, // boolean: true if the gutter tooltip should follow mouse

    // session options
    firstLineNumber: 1, // number: the line number in first line
    overwrite: false, // boolean
    newLineMode: 'auto', // 'auto' | 'unix' | 'windows'
    useWorker: true, // boolean: true if use web worker for loading scripts
    useSoftTabs: true, // boolean: true if we want to use spaces than tabs
    tabSize: 2, // number
    wrap: false, // boolean | string | number: true/'free' means wrap instead of horizontal scroll, false/'off' means horizontal scroll instead of wrap, and number means number of column before wrap. -1 means wrap at print margin
    indentedSoftWrap: false, // boolean
    foldStyle: 'markbegin', // enum: 'manual'/'markbegin'/'markbeginend'.
    theme: 'ace/theme/tomorrow_night_blue',
    mode: 'ace/mode/javascript', // string: path to language mode 
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: false,
    placeholder: '\nTo insert code, press "Control-Space"',
  },  
}
   