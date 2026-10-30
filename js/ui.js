const ui = {
  game: null,
  codeEditor: null,

  mainScene() {
    return(ui.game.scene.getScene('Main'));
  },

  currentPlayer() {
    return(ui.mainScene().currentPlayer);
  },

  handleError(title, message) {
    runner.stop();
    ui.mainScene().errorCount += 1;
    ui.log('Error:', ui.currentPlayer(), ui.mainScene().errorCount, ui.mainScene().errorLimit);
    ui.currentPlayer().hangUp();
    document.getElementById('error-title').innerHTML = title;
    if(ui.mainScene().errorCount <= ui.mainScene().errorLimit && ui.currentPlayer().energy > 0) {
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
      if(dialogs[i].hasAttribute('open')) {
        return true;
      }
    }
    return false;
  },

  //Show the help text for the current editor mode
  showModeHelp(mode) {
    for(const el of document.querySelectorAll('.text-only')) {
      el.style.display = mode === 'text' ? '' : 'none';
    }
    for(const el of document.querySelectorAll('.block-only')) {
      el.style.display = mode === 'block' ? '' : 'none';
    }
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
    let config_json = JSON.parse(localStorage.getItem('config')) || {};
    config_json.stage = document.getElementById('config_stage').value;
    config_json.shuffle = document.getElementById('config_shuffle').value;
    config_json.debug = document.getElementById('config_debug').value;
    config_json.editor = document.getElementById('config_editor').value;
    config_json.master_volume = document.getElementById('config_master_volume').value;
    config_json.bgm_volume = document.getElementById('config_bgm_volume').value;
    localStorage.setItem('config', JSON.stringify(config_json));

    let players_json = JSON.parse(localStorage.getItem('players')) || [{}, {}, {}, {}];
    Object.assign(players_json[0], {id: 0, sprite: 'Cat', name: document.getElementById('config_name_1').value.trim()});
    Object.assign(players_json[1], {id: 1, sprite: 'Rabbit', name: document.getElementById('config_name_2').value.trim()});
    Object.assign(players_json[2], {id: 2, sprite: 'Chick', name: document.getElementById('config_name_3').value.trim()});
    Object.assign(players_json[3], {id: 3, sprite: 'Pig', name: document.getElementById('config_name_4').value.trim()});
    localStorage.setItem('players', JSON.stringify(players_json));
  },

  disableNameEdit() {
    document.getElementById('config_name_1').disabled = true;
    document.getElementById('config_name_2').disabled = true;
    document.getElementById('config_name_3').disabled = true;
    document.getElementById('config_name_4').disabled = true;
    document.getElementById('name-instruction').innerHTML = "*You've already started a game.<br/>Press 'Reset' to start a new game."
  },

  reset() {
    const message = "Are you sure you want to clear all saved data? This action cannot be undone.";
    if(window.confirm(message)) {
      localStorage.clear();
      const forms = document.getElementsByTagName('form');
      for(let form of forms) {
        form.reset();
      }
      window.location.reload();
    }
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
    if(isF5 || isCtrlR || isCtrlShiftR || isCtrlF5 || isCmdR || isCmdShiftR) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    //Assign shortcuts for the game controls
    if(ui.game.scene.isActive('Main')) {
      if(event.ctrlKey && event.key === "r") {
        event.preventDefault();
        document.getElementById("btn_run_code").click();
      }

      if(event.ctrlKey && event.key === "s") {
        event.preventDefault();
        document.getElementById("btn_skip").click();
      }

      if(event.code === "Space" && ui.mainScene().dice.isReadyToRoll()) {
        event.preventDefault();
        ui.mainScene().rollDice();
      }

      if(event.key === 'F1' && ui.mainScene().dice.isReadyToRoll()) {
        event.preventDefault();
        ui.showModal('dialog-config2');
      }

      if(event.key === 'Escape' && runner.interpreter) {
        event.preventDefault();
        runner.interpreter.stopRequested = true;
      }
    }
  },

  //Fit the editors to the column when the browser window is resized
  resizeEditors() {
    textEditor.resize();
    blockEditor.resize();
  },

  log(...args) {
    ui.game.config.debug && console.log(...args);
  },

  init() {
    //Init modal components
    const config_json = JSON.parse(localStorage.getItem('config'));
    const players_json = JSON.parse(localStorage.getItem('players'));
    if(config_json) {
      document.getElementById('config_name_1').value = players_json[0].name;
      document.getElementById('config_name_2').value = players_json[1].name; 
      document.getElementById('config_name_3').value = players_json[2].name;
      document.getElementById('config_name_4').value = players_json[3].name;
      document.getElementById('config_stage').value = config_json.stage;
      document.getElementById('config_debug').value = config_json.debug;
      document.getElementById('config_editor').value = config_json.editor || 'text';
      document.getElementById('config_shuffle').value = config_json.shuffle;       
      document.getElementById('config_master_volume').value = config_json.master_volume;
      document.getElementById('config_bgm_volume').value = config_json.bgm_volume;
      if(config_json.started) {
        ui.disableNameEdit();
      }
    }
    else {
      ui.saveConfig();
    }

    document.getElementById('btn_run_code').addEventListener('click', runner.run);
    document.getElementById('btn_skip').addEventListener('click', ui.skipTurn);
    document.getElementById('btn_help').addEventListener('click', ui.showHelp);
    document.getElementById('btn_config_save').addEventListener('click', ui.saveConfig);
    document.getElementById('btn_reset').addEventListener('click', ui.reset);
    document.getElementById('config_master_volume').addEventListener('change', ui.changeVolume);
    document.getElementById('config_bgm_volume').addEventListener('change', ui.changeVolume);  
    document.getElementById('btn_back').addEventListener('click', ui.switchScene);
    document.getElementById('btn_end').addEventListener('click', ui.switchScene);
    document.getElementById('btn_open_video').addEventListener('click', ui.openVideo);
    document.getElementById('btn_close_video').addEventListener('click', ui.closeVideo);
    window.addEventListener("keydown", ui.assignShortcuts, true);
    window.addEventListener("resize", ui.resizeEditors);

    //Prevent browser context menu
    document.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });

    textEditor.init();

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
