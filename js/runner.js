const runner = {
  interpreter: null,

  //Game commands available to the player's code
  api(interpreter, scope) {
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
    if(!['stage1', 'stage2', 'stage3'].includes(ui.game.config.stage)) {
      interpreter.setProperty(scope, 'steal', interpreter.createAsyncFunction(function(callback) {
        ui.log('steal');
        ui.currentPlayer().steal(callback);
      }));
    }
    interpreter.setProperty(scope, 'disarm', interpreter.createAsyncFunction(function(callback) {
      ui.log('disarm');
      ui.currentPlayer().disarm(callback);
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
    interpreter.setProperty(scope, 'highlight_block', interpreter.createNativeFunction(function(id) {
      blockEditor.highlightBlock(id);
    }));
  },

  init() {
    if(!runner.interpreter) {
      ui.disableButton('btn_run_code');
      ui.disableButton('btn_skip');
      ui.currentPlayer().reposition();
      let code = ui.codeEditor.getCode();
      ui.codeEditor.save(ui.currentPlayer(), code);

      ui.log(code);
      //Turn conditional variables into functions
      const vars = ['path_ahead', 'path_to_the_left', 'path_to_the_right', 'trap_is_on'];
      for (const name of vars) {
        const regex = new RegExp(`\\b${name}\\b(?!\\s*\\()`, 'g');
        code = code.replace(regex, `${name}()`);
      }

      try {
        runner.interpreter = new Interpreter(code, runner.api);
      }
      catch(e) {
        runner.handleError(e.message);
      }
    }
  },

  run() {
    runner.init();
    if(!runner.interpreter) return;

    if(runner.interpreter.getStatus() === Interpreter.Status.DONE) {
      runner.interpreter = null;
      ui.mainScene().changePlayer();
    }
    else if(runner.interpreter.stopRequested) {
      runner.interpreter.stopRequested = false;
      runner.handleError('The code was stopped.');      
    }
    else if(runner.interpreter.getStateStack().length > 1000) {
      runner.handleError('The code kept calling the same function over and over!');      
    }
    else {
      try {
        runner.interpreter.step();
        runner.highlightCode();
        setTimeout(runner.run, 0);
      }
      catch(e) {
        runner.handleError(e.message);
      }
    }
  },

  handleError(message) {
    if(runner.interpreter) {
      runner.interpreter.paused = true;
      runner.interpreter = null;
    }
    ui.mainScene().errorCount += 1;
    ui.log('Error:', ui.currentPlayer(), ui.mainScene().errorCount, ui.mainScene().errorLimit);
    ui.currentPlayer().hangUp();
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

  highlightCode() {
    const stack = runner.interpreter.getStateStack();
    const node = stack[stack.length - 1].node;
    if(['ForStatement', 'IfStatement', 'FunctionDeclaration'].includes(node.type)) {
      ui.mainScene().flags[node.type] = true;
    }
    ui.codeEditor.highlight(node);
  },
}
