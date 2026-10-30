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
    interpreter.setProperty(scope, 'trap_is_on', interpreter.createNativeFunction(function() {
      ui.log('trap_is_on');
      return ui.currentPlayer().trap(CST.TOWARDS_AHEAD);
    }));
    interpreter.setProperty(scope, 'path_ahead', interpreter.createNativeFunction(function() {
      ui.log('path_ahead');
      return ui.currentPlayer().path(CST.TOWARDS_AHEAD);
    }));
    interpreter.setProperty(scope, 'path_to_the_left', interpreter.createNativeFunction(function() {
      ui.log('path_to_the_left');
      return ui.currentPlayer().path(CST.TOWARDS_LEFT);
    }));
    interpreter.setProperty(scope, 'path_to_the_right', interpreter.createNativeFunction(function() {
      ui.log('path_to_the_right');
      return ui.currentPlayer().path(CST.TOWARDS_RIGHT);
    }));
    interpreter.setProperty(scope, 'log', interpreter.createNativeFunction(function(text) {
      console.log('[Interpreter]', text);
      return true;
    }));
    interpreter.setProperty(scope, 'highlight_block', interpreter.createNativeFunction(function(id) {
      blockEditor.highlightBlock(id);
    }));
  },

  init() {
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
      ui.handleError('Syntax Error!', e.message);
    }
  },

  run() {
    if(!runner.interpreter) return;

    if(runner.interpreter.getStatus() === Interpreter.Status.DONE) {
      runner.interpreter = null;
      ui.mainScene().changePlayer();
    }
    else if(runner.interpreter.stopRequested) {
      runner.interpreter.stopRequested = false;
      ui.handleError('Code Stopped!', 'The code was stopped.');      
    }
    else if(runner.interpreter.getStateStack().length > 1000) {
      ui.handleError('Infinite Loop!', 'The code kept calling the same function over and over!');      
    }
    else {
      try {
        runner.interpreter.step();
        runner.highlightCode();
        setTimeout(runner.run, 0);
      }
      catch(e) {
        ui.handleError('Something is wrong!', e.message);
      }
    }
  },

  stop() {
    if(runner.interpreter) {
      runner.interpreter.paused = true;
      runner.interpreter = null;
    }
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
