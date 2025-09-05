function setEditorOptions(editor) {
  editor.setOptions({
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
    theme: 'ace/theme/monokai',
    mode: 'ace/mode/javascript' // string: path to language mode 
  });  
}

function initInterpreter(interpreter, scope) {
  interpreter.setProperty(scope, 'move_forward', interpreter.createNativeFunction(function() {
    debugLog('move_forward');
    return currentPlayer.move();
  }));
  interpreter.setProperty(scope, 'turn_left', interpreter.createNativeFunction(function() {
    debugLog('turn_left');
    return currentPlayer.turn(-1);
  }));
  interpreter.setProperty(scope, 'turn_right', interpreter.createNativeFunction(function() {
    debugLog('turn_right');
    return currentPlayer.turn(1);
  }));
  interpreter.setProperty(scope, 'pick_up', interpreter.createNativeFunction(function() {
    debugLog('turn_right');
    return currentPlayer.pickUp();
  }));
};

function enableButton(id) {
  const btn = document.getElementById(id)
  btn.disabled = false; 
  btn.classList.remove('is-disabled');
} 

function disableButton(id) {
  const btn = document.getElementById(id)
  btn.disabled = true; 
  btn.classList.add('is-disabled');
}

function showModal(id) {
  document.getElementById(id).showModal();
}

function isAnyModalActive() {
  const dialogs = document.getElementsByTagName('dialog');
  for (let i = 0; i < dialogs.length; i++) {
    if (dialogs[i].hasAttribute('open')) {
      return true;
    }
  }
  return false;
}  

function runCode() {
  currentPlayer = game.scene.getScene('Main').currentPlayer;
  currentPlayer.stopIdle();
  try {
    interpreter = new Interpreter(editor.getValue(), initInterpreter);
    setTimeout(runStep, 110);
  }
  catch(e) {
    handleError(e);
  }
}

function runStep() {
  currentPlayer = game.scene.getScene('Main').currentPlayer;
  const animationDelay = 520;
  let stack = interpreter.getStateStack();
  let node = stack[stack.length - 1].node;
  editor.selection.setRange(new ace.Range(node.Y.start.line - 1, node.Y.start.ab, node.Y.end.line - 1, node.Y.end.ab));
  debugLog(interpreter.getStatus(), node.type);
  if (interpreter.getStatus() == Interpreter.Status.DONE) {
    currentPlayer.scene.changePlayer();  
  }
  else {  
    try {
      interpreter.step();
      setTimeout(runStep, node.type == 'CallExpression' ? animationDelay : 0);
    }
    catch(e) {
      handleError(e);
    }
  } 
}

function skipTurn() {
  currentPlayer = game.scene.getScene('Main').currentPlayer;
  currentPlayer.stopIdle();
  interpreter = new Interpreter('', initInterpreter);
  setTimeout(runCode, 110);
}

function handleError(error) {
  document.getElementById('error-message').innerHTML = error.message;
  document.getElementById('dialog-default').showModal();
  debugLog(currentPlayer, error);
  currentPlayer.fail();
  currentPlayer.scene.changePlayer();  
}

function loadConfig() {
  const config = JSON.parse(localStorage.getItem('config'));
  for (const key in config) {
    game.config[key] = config[key];
  }
  game.config.debug = config['debug'] == 'Y' ? true : false;
  debugLog('config loaded:',  game.config);
}

function debugLog(...args) {
  game.config.debug && console.log(...args);
}

//Main Program Code
let editor;
let interpreter;
let game;
let currentPlayer;

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#7DB8EF',
  parent: 'game-container',
  width: 1024,
  height: 704,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  },
  scene: [BootScene, TitleScene, MainScene, ResultScene]
};

document.addEventListener('DOMContentLoaded', function(event) {

  editor = ace.edit('editor');
  setEditorOptions(editor);
  editor.setValue('/*\nAvailable commands:\nturn_right();\nturn_left();\nmove_forward();\npick_up();\n*/\n')
  game = new Phaser.Game(config);
  disableButton('run_code');
  disableButton('skip');

  document.getElementById('run_code').addEventListener('click', function() {
    disableButton('run_code');
    disableButton('skip');
    runCode();
  });

  document.getElementById('skip').addEventListener('click', function() {    
    disableButton('run_code');
    disableButton('skip');
    skipTurn();
  });

  document.getElementById('config-ok').addEventListener('click', function() {
    let config = JSON.parse(localStorage.getItem('config')) || {};
    config.stage = document.getElementById('config_stage').value;
    config.debug = document.getElementById('config_debug').value;
    localStorage.setItem('config', JSON.stringify(config));

    let players = {}
    const name1 = document.getElementById('config_name_1').value.trim();
    if(name1.length > 0) {
      players['Cat'] = {sprite: 'Cat', name: name1};
    }
    const name2 = document.getElementById('config_name_2').value.trim();
    if(name2.length > 0) {
      players['Rabbit'] = {sprite: 'Rabbit', name: name2}
    }
    const name3 = document.getElementById('config_name_3').value.trim();
    if(name3.length > 0) {
      players['Chick'] = {sprite: 'Chick', name: name3}
    }
    const name4 = document.getElementById('config_name_4').value.trim();
    if(name4.length > 0) {
      players['Pig'] = {sprite: 'Pig', name: name4}
    }
    localStorage.setItem('players', JSON.stringify(players));

    debugLog('Config Saved:', players, config);
  });

  document.getElementById('btn_back').addEventListener('click', function() {
    game.scene.stop('Main');
    game.scene.start('Title');
  });

  document.getElementById('btn_end').addEventListener('click', function() {    
    game.scene.stop('Main');
    game.scene.start('Result');
  });

  document.getElementById('config_master_volume').addEventListener('change', (event) => {
    const newVolume = parseFloat(event.target.value);
    game.config.master_volume = newVolume;
    game.scene.getScene('Main').sound.volume = newVolume; 
  });

  document.getElementById('config_bgm_volume').addEventListener('change', (event) => {
    const newVolume = parseFloat(event.target.value);
    game.config.bgm_volume = newVolume;
    game.scene.getScene('Main').bgm.setVolume(newVolume); 
  });

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a' && game.scene.isActive('Main')) {
      e.preventDefault();
      document.getElementById('dialog-config2').showModal();
    }
  });

});
