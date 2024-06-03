class CodeRunner {

  constructor(code) {
    this.interpreter = new Interpreter(code, function(interpreter, scope) {
      interpreter.setProperty(scope, 'move_forward', interpreter.createNativeFunction(function() {
        console.log("move_forward");
        return currentScene.move();
      }));
      interpreter.setProperty(scope, 'turn_left', interpreter.createNativeFunction(function() {
        console.log("turn_left");
        return currentScene.turn(-1);
      }));
      interpreter.setProperty(scope, 'turn_right', interpreter.createNativeFunction(function() {
        console.log("turn_right");
        return currentScene.turn(1);
      }));
    });
  }
  
  stepCode() {
    console.log(this.interpreter);
    var stack = this.interpreter.getStateStack();
    var node = stack[stack.length - 1].node;
    var delay;
        console.log(node);
    if (this.interpreter.step()) {
      if (node.type == "CallExpression") {
        delay = 500;
      }
      else {
        delay = 0;
      }
      setTimeout(this.stepCode, delay);
    }
  }
  
  runCode() {
    this.stepCode();
  }
}