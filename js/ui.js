const ui = {
  game: null,
  editor: null,
  interpreter: null,

  mainScene() {
    return(ui.game.scene.getScene('Main'));
  },

  currentPlayer() {
    return(ui.mainScene().currentPlayer);
  },

  gameApi(interpreter, scope) {
    interpreter.setProperty(scope, 'move_forward', interpreter.createAsyncFunction(function(callback) {
      ui.log('move_forward');
      ui.currentPlayer().move(callback);
    }));
    interpreter.setProperty(scope, 'turn_left', interpreter.createAsyncFunction(function(callback) {
      ui.log('turn_left');
      ui.currentPlayer().turn(CST.TOWARDS_LEFT, callback);
    }));
    interpreter.setProperty(scope, 'turn_right', interpreter.createAsyncFunction(function(callback) {
      ui.log('turn_right');
      ui.currentPlayer().turn(CST.TOWARDS_RIGHT, callback);
    }));
    interpreter.setProperty(scope, 'pick_up', interpreter.createAsyncFunction(function(callback) {
      ui.log('pick_up');
      ui.currentPlayer().pickUp(callback);
    }));
    interpreter.setProperty(scope, 'eat', interpreter.createAsyncFunction(function(callback) {
      ui.log('eat');
      ui.currentPlayer().eat(callback);
    }));
    interpreter.setProperty(scope, 'steal', interpreter.createAsyncFunction(function(callback) {
      ui.log('steal');
      ui.currentPlayer().steal(callback);
    }));
    interpreter.setProperty(scope, 'stop_trap', interpreter.createAsyncFunction(function(callback) {
      ui.log('stop_trap');
      ui.currentPlayer().stopTrap(callback);
    }));
    interpreter.setProperty(scope, 'trap_is_on', interpreter.createAsyncFunction(function(callback) {
      ui.log('trap_is_on');
      callback(ui.currentPlayer().trap(CST.TOWARDS_AHEAD));
    }));
    interpreter.setProperty(scope, 'path_ahead', interpreter.createAsyncFunction(function(callback) {
      ui.log('path_ahead');
      callback(ui.currentPlayer().path(CST.TOWARDS_AHEAD));
    }));
    interpreter.setProperty(scope, 'path_to_the_left', interpreter.createAsyncFunction(function(callback) {
      ui.log('path_to_the_left');
      callback(ui.currentPlayer().path(CST.TOWARDS_LEFT));
    }));
    interpreter.setProperty(scope, 'path_to_the_right', interpreter.createAsyncFunction(function(callback) {
      ui.log('path_to_the_right');
      callback(ui.currentPlayer().path(CST.TOWARDS_RIGHT));
    }));
    interpreter.setProperty(scope, 'log', interpreter.createAsyncFunction(function(text, callback) {
      console.log('[Interpreter]', text);
      callback(true);
    }));
  },

  prepareCode() {
    if(!ui.interpreter) {
      ui.disableButton('btn_run_code');
      ui.disableButton('btn_skip');
      ui.currentPlayer().reposition();
      let code = ui.editor.getValue();

      //Preserve functions for the next turn
      const functions = code.match(/function\s+\w+\s*\([^)]*\)\s*\{[^}]*\}/gs) || [];
      ui.currentPlayer().code = functions.join('\n\n');

      //Turn conditional variables into functions
      const vars = ['path_ahead', 'path_to_the_left', 'path_to_the_right', 'trap_is_on'];
      for (const name of vars) {
        const regex = new RegExp(`\\b${name}\\b(?!\\s*\\()`, 'g');
        code = code.replace(regex, `${name}()`);
      }

      try {
        ui.interpreter = new Interpreter(code, ui.gameApi);
      }
      catch(e) {
        ui.handleError(e.message);
      }
    }
  },

  runCode() {
    ui.prepareCode();
        
    if (ui.interpreter.getStatus() === Interpreter.Status.DONE) {
      ui.interpreter = null;
      ui.mainScene().changePlayer();
    }
    else if(ui.interpreter.stopRequested) {
      ui.interpreter.stopRequested = false;
      ui.handleError('The code was stopped by the moderator.');      
    }
    else if(ui.interpreter.getStateStack().length > 1000) {
      ui.handleError('The code kept calling the same function over and over!');      
    }
    else {
      try {
        ui.interpreter.step();
        ui.highlightCode();
        setTimeout(ui.runCode, 0);
      }
      catch(e) {
        ui.handleError(e.message);
      }
    }
  },

  handleError(message) {
    if(ui.interpreter) {
      ui.interpreter.paused = true;
      ui.interpreter = null;
    }
    ui.mainScene().errorCount += 1;
    ui.log('Error:', ui.currentPlayer(), ui.mainScene().errorCount, ui.mainScene().errorAllowance);
    ui.currentPlayer().hangUp();
    if(ui.mainScene().errorCount <= ui.mainScene().errorAllowance && ui.currentPlayer().energy > 0) {
      document.getElementById('error-message').innerHTML = `${message}<br/>Debug your code and run it again!`;
      ui.currentPlayer().bounce();
      ui.enableButton('btn_run_code');
      ui.enableButton('btn_skip');
    }
    else {
      document.getElementById('error-message').innerHTML = `${message}<br/>Moving onto the next player!`;
      ui.mainScene().changePlayer();  
    }
    ui.showModal('dialog-default');
  },

  skipTurn() {
    ui.disableButton('btn_run_code');
    ui.disableButton('btn_skip');
    ui.currentPlayer().reposition();
    ui.mainScene().changePlayer();
  },

  highlightCode() {
    const stack = ui.interpreter.getStateStack();
    const node = stack[stack.length - 1].node;
    if(['ForStatement', 'IfStatement', 'FunctionDeclaration'].includes(node.type)) {
      ui.mainScene().flags[node.type] = true;
    }
    ui.editor.selection.setRange(new ace.Range(node.O.start.line - 1, node.O.start.eb, node.O.end.line - 1, node.O.end.eb));
  },

  loadSnippets(snippets) {
    if(ui.editor.session.interval) clearInterval(ui.editor.session.interval);
    const session = ui.editor.session;
    session.setUseWrapMode(false);
    session.setMode("ace/mode/javascript");
    ui.editor.setValue("");
    const snippetCompleter = {
      getCompletions: function(editor, session, pos, prefix, callback) {
          const list = snippets.map((snippet, index) => ({
            caption: snippet.caption,
            value: snippet.value,
            docText: snippet.help,
            score: 1000 - index
          }));
          callback(null, list);
      }
    }
    ui.editor.completers = [snippetCompleter];
  },

  insertText(text, speed = 50, callback) {
    let index = 0;
    ui.editor.setValue("");
    const session = ui.editor.session;
    session.setUseWrapMode(true);
    session.setMode("ace/mode/text");
    if(ui.editor.session.interval) clearInterval(ui.editor.session.interval);
    ui.editor.session.interval = setInterval(() => {
      if (index < text.length) {
        const ch = text[index];
        session.insert(ui.editor.getCursorPosition(), ch);
        index++;
      } else {
        clearInterval(ui.editor.session.interval);
        if (callback) callback();
      }
    }, speed);
  },

  enableButton(id) {
    const btn = document.getElementById(id)
    btn.disabled = false; 
    btn.classList.remove('is-disabled');
    return(btn);
  }, 

  disableButton(id) {
    const btn = document.getElementById(id)
    btn.disabled = true; 
    btn.classList.add('is-disabled');
    return(btn);
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

  showHelp() {
    ui.showModal('dialog-help');
  },
  
  openVideo(event) {
    const iframe = document.getElementById("driveVideo");
    const fileId = ui.mainScene().stageConfig.video
    if(fileId) {
      ui.mainScene().sound.pauseAll();
      iframe.src = `https://drive.google.com/file/d/${fileId}/preview`;
      ui.showModal('dialog-video');
    }
  },

  closeVideo() {
    const dialog = document.getElementById("dialog-video");
    const iframe = document.getElementById("driveVideo");
    iframe.src = "";
    dialog.close();
    if(!ui.mainScene().isStarted) {
      ui.mainScene().startStage();
    }
    else {
      ui.mainScene().sound.resumeAll();
    }
  },

  saveConfig() {
    let players_json = [];
    players_json[0] = {id: 0, sprite: 'Cat', name: document.getElementById('config_name_1').value.trim()};
    players_json[1] = {id: 1, sprite: 'Rabbit', name: document.getElementById('config_name_2').value.trim()}
    players_json[2] = {id: 2, sprite: 'Chick', name: document.getElementById('config_name_3').value.trim()}
    players_json[3] = {id: 3, sprite: 'Pig', name: document.getElementById('config_name_4').value.trim()}
    localStorage.setItem('players', JSON.stringify(players_json));

    let config_json = JSON.parse(localStorage.getItem('config')) || {};
    config_json.stage = document.getElementById('config_stage').value;
    config_json.shuffle = document.getElementById('config_shuffle').value;
    config_json.debug = document.getElementById('config_debug').value;
    config_json.master_volume = document.getElementById('config_master_volume').value;
    config_json.bgm_volume = document.getElementById('config_bgm_volume').value;
    localStorage.setItem('config', JSON.stringify(config_json));

    console.log('Data saved:', players_json, config_json);
  },

  changeVolume(event) {
    const newVolume = parseFloat(event.target.value);
    if(event.target.id === 'config_master_volume') {
      ui.game.config.master_volume = newVolume;
      ui.mainScene().sound.volume = newVolume; 
    }
    else {  
      ui.game.config.bgm_volume = newVolume;
      ui.mainScene().bgm.setVolume(newVolume); 
    }
  },

  switchScene(event) {
    ui.game.scene.stop('Main');
    if(event.target.id === 'btn_end') {
      ui.game.scene.start('Result');
    }
    else {
      ui.game.scene.start('Title');
    }  
  },

  assignShortcuts(event) {
    //Prevent browser refresh shortcuts
    const k = event.key.toLowerCase();
    const isF5 = event.key === "F5";
    const isCtrlR = event.ctrlKey && !event.metaKey && k === "r";
    const isCtrlShiftR = event.ctrlKey && event.shiftKey && k === "r";
    const isCtrlF5 = event.ctrlKey && event.key === "F5";
    const isCmdR = event.metaKey && k === "r";
    const isCmdShiftR = event.metaKey && event.shiftKey && k === "r";
    if (isF5 || isCtrlR || isCtrlShiftR || isCtrlF5 || isCmdR || isCmdShiftR) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    //Assign shortcuts for the game controls
    if(ui.game.scene.isActive('Main')) {
      if (event.ctrlKey && event.key === "r") {
        event.preventDefault();
        document.getElementById("btn_run_code").click();
      }

      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        document.getElementById("btn_skip").click();
      }

      if (event.code === "Space" && ui.mainScene().dice.isReadyToRoll()) {
        event.preventDefault();
        ui.mainScene().rollDice();
      }

      if(event.key === 'F1') {
        event.preventDefault();
        ui.showModal('dialog-config2');
      }

      if(event.key === 'Escape' && ui.interpreter) {
        event.preventDefault();
        ui.interpreter.stopRequested = true;
      }
    }
  },

  log(...args) {
    ui.game.config.debug && console.log(...args);
  },

  init() {
    //Init modal components
    const config_json = JSON.parse(localStorage.getItem('config'));
    const players_json = JSON.parse(localStorage.getItem('players'));
    if(config_json) {
      document.getElementById('config_name_1').value = players_json[0] ? players_json[0].name : "";
      document.getElementById('config_name_2').value = players_json[1] ? players_json[1].name : ""; 
      document.getElementById('config_name_3').value = players_json[2] ? players_json[2].name : "";
      document.getElementById('config_name_4').value = players_json[3] ? players_json[3].name : "";
      document.getElementById('config_stage').value = config_json.stage;
      document.getElementById('config_debug').value = config_json.debug;
      document.getElementById('config_shuffle').value = config_json.shuffle;       
      document.getElementById('config_master_volume').value = config_json.master_volume;
      document.getElementById('config_bgm_volume').value = config_json.bgm_volume;
    }
    else {
      ui.saveConfig();
    }

    document.getElementById('btn_run_code').addEventListener('click', ui.runCode);
    document.getElementById('btn_skip').addEventListener('click', ui.skipTurn);
    document.getElementById('btn_help').addEventListener('click', ui.showHelp);
    document.getElementById('btn_config_save').addEventListener('click', ui.saveConfig);
    document.getElementById('config_master_volume').addEventListener('change', ui.changeVolume);
    document.getElementById('config_bgm_volume').addEventListener('change', ui.changeVolume);  
    document.getElementById('btn_back').addEventListener('click', ui.switchScene);
    document.getElementById('btn_end').addEventListener('click', ui.switchScene);
    document.getElementById('btn_open_video').addEventListener('click', ui.openVideo);
    document.getElementById('btn_close_video').addEventListener('click', ui.closeVideo);
    window.addEventListener("keydown", ui.assignShortcuts, true);

    //Prevent browser context menu
    document.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });

    ui.editor = ace.edit('editor', CST.EDITOR_CONFIG);
    ui.editor.commands.bindKey("F1", null);
    ui.editor.container.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        const renderer = ui.editor.renderer;
        const canvasPos = renderer.scroller.getBoundingClientRect();
        const x = e.clientX - canvasPos.left;
        const y = e.clientY - canvasPos.top;
        const rowCol = renderer.screenToTextCoordinates(x, y);
        ui.editor.moveCursorToPosition(rowCol);
        ui.editor.execCommand("startAutocomplete");
    });

    ui.game = new Phaser.Game({
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
    });
  }
}

document.addEventListener('DOMContentLoaded', function(event) {
  ui.init();
});
