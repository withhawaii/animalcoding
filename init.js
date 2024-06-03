function setEditorOptions(editor) {
  editor.setOptions({
    selectionStyle: 'line',// "line"|"text"
    highlightActiveLine: true, // boolean
    highlightSelectedWord: true, // boolean
    readOnly: false, // boolean: true if read only
    cursorStyle: 'ace', // "ace"|"slim"|"smooth"|"wide"
    mergeUndoDeltas: true, // false|true|"always"
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
    newLineMode: 'auto', // "auto" | "unix" | "windows"
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
};

function runCode() {
  var stack = interpreter.getStateStack();
  var node = stack[stack.length - 1].node;
  //    console.log(node);
  if (interpreter.step()) {
    if (node.type == "CallExpression") {
      delay = 500;
    }
    else {
      delay = 0;
    }
    setTimeout(runCode, delay);
  }
}

//Main Program Code
var code_runner;
var editor;
var interpreter;
var game;
var currentScene;

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#222222",
  parent: 'game-container',
  width: 1024,
  height: 576,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }
    }
  },
  scene: [Main]
};

document.addEventListener("DOMContentLoaded", function(event) {

  editor = ace.edit("editor");
  setEditorOptions(editor);
  editor.setValue("for (var i = 0; i < 8; i++) {\n  turn_right();\n  move_forward();\n}")

  game = new Phaser.Game(config);

  document.getElementById("run_code").addEventListener("click", function() {
    var code = editor.getValue();
    interpreter = new Interpreter(code, initInterpreter);
    runCode();
  });
});
