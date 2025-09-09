const ui = {
  editor: null,
  interpreter: null,
  game: null,
  currentPlayer: null,
  errorCount: 0,
  errorAllowance: 1,

  editorConfig: {
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
  },

  gameConfig: {
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
  },

  interpreterConfig(interpreter, scope) {
    interpreter.setProperty(scope, 'move_forward', interpreter.createNativeFunction(function() {
      ui.log('move_forward');
      return ui.currentPlayer.move();
    }));
    interpreter.setProperty(scope, 'turn_left', interpreter.createNativeFunction(function() {
      ui.log('turn_left');
      return ui.currentPlayer.turn(-1);
    }));
    interpreter.setProperty(scope, 'turn_right', interpreter.createNativeFunction(function() {
      ui.log('turn_right');
      return ui.currentPlayer.turn(1);
    }));
    interpreter.setProperty(scope, 'pick_up', interpreter.createNativeFunction(function() {
      ui.log('turn_right');
      return ui.currentPlayer.pickUp();
    }));
  },

  runCode() {
    ui.disableButton('run_code');
    ui.disableButton('skip');
    ui.currentPlayer.reposition();
    try {
      ui.interpreter = new Interpreter(ui.editor.getValue(), ui.interpreterConfig);
      setTimeout(ui.runStep, 110);
    }
    catch(e) {
      ui.handleError(e);
    }
  },

  runStep() {
    const animationDelay = 520;
    let stack = ui.interpreter.getStateStack();
    let node = stack[stack.length - 1].node;
    ui.editor.selection.setRange(new ace.Range(node.Y.start.line - 1, node.Y.start.ab, node.Y.end.line - 1, node.Y.end.ab));
    ui.log(ui.interpreter.getStatus(), node.type);
    if (ui.interpreter.getStatus() == Interpreter.Status.DONE) {
      ui.currentPlayer.scene.changePlayer();  
    }
    else {  
      try {
        ui.interpreter.step();
        setTimeout(ui.runStep, node.type == 'CallExpression' ? animationDelay : 0);
      }
      catch(e) {
        ui.handleError(e);
      }
    } 
  },

  handleError(error) {
    ui.errorCount += 1;
    ui.currentPlayer.error += 1;
    ui.log('Error:', ui.currentPlayer, ui.errorCount, ui.errorAllowance);
    ui.currentPlayer.hangUp();
    if(ui.errorCount <= ui.errorAllowance) {
      document.getElementById('error-message').innerHTML = `${error.message}.<br/>Debug your code and run it again!`;
      ui.currentPlayer.bounce();
      ui.enableButton('run_code');
      ui.enableButton('skip');
    }
    else {
      document.getElementById('error-message').innerHTML = `${error.message}.<br/>Moving onto the next player!`;
      ui.currentPlayer.scene.changePlayer();  
    }
    ui.showModal('dialog-default');
  },

  skipTurn() {
    ui.disableButton('run_code');
    ui.disableButton('skip');
    ui.currentPlayer.reposition();
    ui.interpreter = new Interpreter('', ui.initInterpreter);
    setTimeout(ui.runCode, 110);
  },

  loadSnippets(key) {
    const menu = document.getElementById("snippet_select");
    while (menu.options.length > 1) {
      menu.remove(1); // remove the second item each time
    }
    CST.SNIPPETS[key].forEach((value, index) => {
      const option = document.createElement("option");
      option.value = value[0];
      option.textContent = value[1];
      menu.appendChild(option);
    });
  },

  insertCode(event) {
    const snippet = event.target.value;
    if (snippet) {
      ui.editor.session.insert(ui.editor.getCursorPosition(), snippet + "\n");
      event.target.value = "";
    }
  },

  enableButton(id) {
    const btn = document.getElementById(id)
    btn.disabled = false; 
    btn.classList.remove('is-disabled');
  }, 

  disableButton(id) {
    const btn = document.getElementById(id)
    btn.disabled = true; 
    btn.classList.add('is-disabled');
  },

  showModal(id) {
    document.getElementById(id).showModal();
  },

  isAnyModalActive() {
    const dialogs = document.getElementsByTagName('dialog');
    for (let i = 0; i < dialogs.length; i++) {
      if (dialogs[i].hasAttribute('open')) {
        return true;
      }
    }
    return false;
  },

  saveConfig() {
    let config = JSON.parse(localStorage.getItem('config')) || {};
    config.stage = document.getElementById('config_stage').value;
    config.debug = document.getElementById('config_debug').value;
    config.master_volume = document.getElementById('config_master_volume').value;
    config.bgm_volume = document.getElementById('config_bgm_volume').value;
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

    console.log('Config saved:', players, config);    
  },

  changeVolume(event) {
    const newVolume = parseFloat(event.target.value);
    if(event.target.id == 'config_master_volume') {
      ui.game.config.master_volume = newVolume;
      ui.game.scene.getScene('Main').sound.volume = newVolume; 
    }
    else {  
      ui.game.config.bgm_volume = newVolume;
      ui.game.scene.getScene('Main').bgm.setVolume(newVolume); 
    }
  },

  switchScene(event) {
    ui.game.scene.stop('Main');
    if(event.target.id == 'btn_end') {
      ui.game.scene.start('Result');
    }
    else {
      ui.game.scene.start('Title');
    }  
  },

  log(...args) {
    ui.game.config.debug && console.log(...args);
  },

  init() {
    let config_saved = JSON.parse(localStorage.getItem('config'));
    if(!config_saved) {
      ui.saveConfig();
      config_saved = JSON.parse(localStorage.getItem('config'));
    }
    document.getElementById('config_stage').value = config_saved.stage
    document.getElementById('config_debug').value = config_saved.debug
    document.getElementById('config_master_volume').value = config_saved.master_volume
    document.getElementById('config_bgm_volume').value = config_saved.bgm_volume       
    document.getElementById('run_code').addEventListener('click', ui.runCode);
    document.getElementById('snippet_select').addEventListener('change', ui.insertCode);
    document.getElementById('skip').addEventListener('click', ui.skipTurn);
    document.getElementById('config_save').addEventListener('click', ui.saveConfig);
    document.getElementById('config_master_volume').addEventListener('change', ui.changeVolume);
    document.getElementById('config_bgm_volume').addEventListener('change', ui.changeVolume);  
    document.getElementById('btn_back').addEventListener('click', ui.switchScene);
    document.getElementById('btn_end').addEventListener('click', ui.switchScene);

    //Ctrl + shift + a to show a play options modal
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a' && ui.game.scene.isActive('Main')) {
        e.preventDefault();
        ui.showModal('dialog-config2');
      }
    });

    ui.editor = ace.edit('editor', ui.editorConfig);
    ui.game = new Phaser.Game(ui.gameConfig);
    ui.disableButton('run_code');
    ui.disableButton('skip');
  }
}

document.addEventListener('DOMContentLoaded', function(event) {
  ui.init();
});
