const ui = {
  editor: null,
  interpreter: null,
  game: null,
  currentPlayer: null,
  errorCount: 0,
  errorAllowance: 1,

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
      return ui.currentPlayer.take(callback);
    }));
    interpreter.setProperty(scope, 'stop_trap', interpreter.createAsyncFunction(function(callback) {
      ui.log('stop_trap');
      return ui.currentPlayer.stopTrap(callback);
    }));
    interpreter.setProperty(scope, 'trap_is_on', ui.currentPlayer.trapAhead());
    interpreter.setProperty(scope, 'path_ahead', ui.currentPlayer.pathAhead());
  },

  prepareCode() {
    ui.disableButton('run_code');
    ui.disableButton('skip');
    ui.currentPlayer.reposition();
    try {
      ui.currentPlayer.code = ui.editor.getValue();
      ui.interpreter = new Interpreter(ui.currentPlayer.code, ui.gameApi);
    }
    catch(e) {
      ui.handleError(e);
    }
  },

  runCode() {
    if(!ui.interpreter) {
      ui.prepareCode();
    }
    
    let stack = ui.interpreter.getStateStack();
    let node = stack[stack.length - 1].node;
    ui.editor.selection.setRange(new ace.Range(node.Y.start.line - 1, node.Y.start.ab, node.Y.end.line - 1, node.Y.end.ab));
    ui.log('interpreter status:', ui.interpreter.getStatus());

    if (ui.interpreter.getStatus() == Interpreter.Status.DONE) {
      ui.interpreter = null;
      ui.currentPlayer.scene.changePlayer();
    }
    else {
      try {
        ui.interpreter.run();
        setTimeout(ui.runCode, 520);
      }
      catch(e) {
        ui.interpreter.paused = true;
        ui.interpreter = null;
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

  loadSnippets(snippets) {
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
    config.shuffle = document.getElementById('config_shuffle').value;
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
    document.getElementById('snippet_select').addEventListener('change', ui.insertSnippet);
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

    ui.editor = ace.edit('editor', CST.EDITOR_CONFIG);
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
