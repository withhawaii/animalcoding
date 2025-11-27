const ui = {
  editor: null,
  interpreter: null,
  game: null,
  currentPlayer: null,
  errorCount: 0,
  errorAllowance: 1,
  stopRequested: false,

  gameApi(interpreter, scope) {
    interpreter.setProperty(scope, 'move_forward', interpreter.createAsyncFunction(function(callback) {
      ui.log('move_forward');
      ui.currentPlayer.move(callback);
    }));
    interpreter.setProperty(scope, 'turn_left', interpreter.createAsyncFunction(function(callback) {
      ui.log('turn_left');
      ui.currentPlayer.turn(-1, callback);
    }));
    interpreter.setProperty(scope, 'turn_right', interpreter.createAsyncFunction(function(callback) {
      ui.log('turn_right');
      ui.currentPlayer.turn(1, callback);
    }));
    interpreter.setProperty(scope, 'pick_up', interpreter.createAsyncFunction(function(callback) {
      ui.log('turn_right');
      return ui.currentPlayer.pickUp(callback);
    }));
    interpreter.setProperty(scope, 'take', interpreter.createAsyncFunction(function(callback) {
      ui.log('take');
      ui.currentPlayer.take(callback);
    }));
    interpreter.setProperty(scope, 'stop_trap', interpreter.createAsyncFunction(function(callback) {
      ui.log('stop_trap');
      ui.currentPlayer.stopTrap(callback);
    }));
    interpreter.setProperty(scope, 'trap_is_on', interpreter.createAsyncFunction(function(callback) {
      ui.log('trap_is_on');
      callback(ui.currentPlayer.trapAhead());
    }));
    interpreter.setProperty(scope, 'path_ahead', interpreter.createAsyncFunction(function(callback) {
      ui.log('path_ahead');
      callback(ui.currentPlayer.pathAhead());
    }));
    interpreter.setProperty(scope, 'log', interpreter.createAsyncFunction(function(text, callback) {
      console.log('[Interpreter]', text);
      callback(true);
    }));
  },

  prepareCode() {
    if(!ui.interpreter) {
      ui.disableButton('run_code');
      ui.disableButton('skip');
      ui.currentPlayer.reposition();
      try {
        let code = ui.editor.getValue();
        //Preserve functions for the next turn
        ui.currentPlayer.code = code.match(/function\s+\w+\s*\([^)]*\)\s*\{[^}]*\}/gs).join('\n\n');
        const vars = ['path_ahead', 'trap_is_on'];
        for (const name of vars) {
          const regex = new RegExp(`\\b${name}\\b(?!\\s*\\()`, 'g');
          code = code.replace(regex, `${name}()`);
        }
        ui.interpreter = new Interpreter(code, ui.gameApi);
      }
      catch(e) {
        ui.interpreter.paused = true;
        ui.interpreter = null;
        ui.handleError(e);
      }
    }
  },

  runCode() {
    ui.prepareCode();
        
    if (ui.interpreter.getStatus() == Interpreter.Status.DONE || ui.stopRequested) {
      ui.interpreter = null;
      ui.stopRequested = false;
      ui.currentPlayer.scene.changePlayer();
    }
    else {
      try {
        ui.interpreter.run();
        ui.highlightCode();
        setTimeout(ui.runCode, 520);
      }
      catch(e) {
        ui.interpreter.paused = true;
        ui.interpreter = null;
        ui.handleError(e);
      }
    }
  },

  highlightCode() {
    const stack = ui.interpreter.getStateStack();
    const node = stack[stack.length - 1].node;
//    console.log(node);
    ui.editor.selection.setRange(new ace.Range(node.O.start.line - 1, node.O.start.eb, node.O.end.line - 1, node.O.end.eb));
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
    ui.currentPlayer.scene.changePlayer();
  },

  loadSnippets(snippets) {
    if(ui.editor.session.interval) clearInterval(ui.editor.session.interval);
    const session = ui.editor.session;
    session.setUseWrapMode(false);
    session.setMode("ace/mode/javascript");
    ui.editor.setValue("");

    const menu = document.getElementById("snippet_select");
    while (menu.options.length > 1) {
      menu.remove(1); // remove the second item each time
    }
    snippets.forEach((value, index) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      menu.appendChild(option);
    });
  },

  insertSnippet(event) {
    const snippet = event.target.value;
    if (snippet) {
      ui.editor.session.insert(ui.editor.getCursorPosition(), snippet + "\n");
      event.currentTarget.value = "";
    }
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
    let players = {}
    const name1 = document.getElementById('config_name_1').value.trim();
    const name2 = document.getElementById('config_name_2').value.trim();
    const name3 = document.getElementById('config_name_3').value.trim();
    const name4 = document.getElementById('config_name_4').value.trim();
    if(name1.length > 0) players['Cat'] = {sprite: 'Cat', name: name1};
    if(name2.length > 0) players['Rabbit'] = {sprite: 'Rabbit', name: name2}
    if(name3.length > 0) players['Chick'] = {sprite: 'Chick', name: name3}
    if(name4.length > 0) players['Pig'] = {sprite: 'Pig', name: name4}
    localStorage.setItem('players', JSON.stringify(players));

    let config = JSON.parse(localStorage.getItem('config')) || {};
    config.stage = document.getElementById('config_stage').value;
    config.shuffle = document.getElementById('config_shuffle').value;
    config.debug = document.getElementById('config_debug').value;
    config.master_volume = document.getElementById('config_master_volume').value;
    config.bgm_volume = document.getElementById('config_bgm_volume').value;
    localStorage.setItem('config', JSON.stringify(config));

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
    document.getElementById('snippet_select').addEventListener('change', ui.insertSnippet);
    document.getElementById('skip').addEventListener('click', ui.skipTurn);
    document.getElementById('config_save').addEventListener('click', ui.saveConfig);
    document.getElementById('config_master_volume').addEventListener('change', ui.changeVolume);
    document.getElementById('config_bgm_volume').addEventListener('change', ui.changeVolume);  
    document.getElementById('btn_back').addEventListener('click', ui.switchScene);
    document.getElementById('btn_end').addEventListener('click', ui.switchScene);

    document.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });

    window.addEventListener('keydown', (e) => {

      //Ctrl + shift + a to show a play options modal
      if(e.key === 'F1' && ui.game.scene.isActive('Main')) {
        e.preventDefault();
        ui.showModal('dialog-config2');
      }

      //Ctrl + shift + s to stop running code
      if(e.key === 'Escape' && ui.interpreter) {
        e.preventDefault();
        console.warn("Requesting stop");
        ui.stopRequested = true;
      }    
    });

    ui.editor = ace.edit('editor', CST.EDITOR_CONFIG);
    ui.editor.commands.bindKey("F1", null);
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
    ui.disableButton('run_code');
    ui.disableButton('skip');
  }
}

document.addEventListener('DOMContentLoaded', function(event) {
  ui.init();
});
