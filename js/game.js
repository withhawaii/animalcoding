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
//    console.log("move_forward");
    return currentPlayer.move();
  }));
  interpreter.setProperty(scope, 'turn_left', interpreter.createNativeFunction(function() {
//    console.log("turn_left");
    return currentPlayer.turn(-1);
  }));
  interpreter.setProperty(scope, 'turn_right', interpreter.createNativeFunction(function() {
//    console.log("turn_right");
    return currentPlayer.turn(1);
  }));
  interpreter.setProperty(scope, 'pick_up', interpreter.createNativeFunction(function() {
    //    console.log("turn_right");
        return currentPlayer.pickUp();
  }));
};

function enableButton(id) {
  const btn = document.getElementById(id)
  btn.disabled = false; 
  btn.classList.remove("is-disabled");
} 

function disableButton(id) {
  const btn = document.getElementById(id)
  btn.disabled = true; 
  btn.classList.add("is-disabled");
}

function showError(message) {
  document.getElementById('error-message').innerHTML = message;
  document.getElementById('dialog-default').showModal();
}

function runCode() {
  const animationDelay = 510;
  let stack = interpreter.getStateStack();
  let node = stack[stack.length - 1].node;
  let Range = ace.require("ace/range").Range;
  editor.selection.setRange(new Range(node.Y.start.line - 1, node.Y.start.ab, node.Y.end.line - 1, node.Y.end.ab));
  console.log(interpreter.getStatus(), node.type);
  if (interpreter.getStatus() == Interpreter.Status.DONE) {
    currentPlayer.scene.changePlayer();
  }
  else {
    try {
      interpreter.step();
      setTimeout(runCode, node.type == "CallExpression" ? animationDelay + 10 : 0);
    }
    catch(e) {
      showError(e.message);
      currentPlayer.error();
      setTimeout(runCode, 600);
    }
  } 
}

//Main Program Code
let editor;
let interpreter;
let game;
let currentPlayer;
let debug = false;

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#7DB8EF",
  parent: 'game-container',
  width: 1024,
  height: 704,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }
    }
  },
  scene: [MainScene]
};

document.addEventListener("DOMContentLoaded", function(event) {

  editor = ace.edit("editor");
  setEditorOptions(editor);
  editor.setValue("/*\nAvailable commands:\nturn_right();\nturn_left();\nmove_forward();\npick_up();\n*/\n")
  game = new Phaser.Game(config);
  disableButton("run_code");
  disableButton("skip");
  if(debug) {
    console.log("DEBUG mode enabled!");
  }

  document.getElementById("run_code").addEventListener("click", function() {
    interpreter = new Interpreter(editor.getValue(), initInterpreter);
    currentPlayer.stopIdle();
    setTimeout(runCode, 110);
    disableButton("run_code");
    disableButton("skip");
  });

  document.getElementById("skip").addEventListener("click", function() {
    interpreter = new Interpreter("", initInterpreter);
    currentPlayer.stopIdle();
    setTimeout(runCode, 110);
    disableButton("run_code");
    disableButton("skip");
  });

});
