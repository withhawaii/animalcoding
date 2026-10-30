const textEditor = {
  editor: null,

  init() {
    textEditor.editor = ace.edit('editor', {
      displayIndentGuides: false,
      showInvisibles: true,
      highlightGutterLine: false,
      fontSize: 14,
      tabSize: 2,
      indentedSoftWrap: false,      
      theme: 'ace/theme/tomorrow_night_blue',
      mode: 'ace/mode/javascript',
      enableBasicAutocompletion: true,
      placeholder: '\nTo insert code, press "Control-Space"',
    });
    textEditor.editor.commands.bindKey("F1", null);
    textEditor.editor.container.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        const renderer = textEditor.editor.renderer;
        const canvasPos = renderer.scroller.getBoundingClientRect();
        const x = e.clientX - canvasPos.left;
        const y = e.clientY - canvasPos.top;
        const rowCol = renderer.screenToTextCoordinates(x, y);
        textEditor.editor.moveCursorToPosition(rowCol);
        textEditor.editor.execCommand("startAutocomplete");
    });
  },

  show() {
    document.getElementById('blockly').style.display = 'none';
    document.getElementById('editor').style.display = '';
    ui.showModeHelp('text');
  },

  resize() {
    textEditor.editor.resize();
  },

  loadStage(snippets) {
    if(textEditor.editor.session.interval) clearInterval(textEditor.editor.session.interval);
    const session = textEditor.editor.session;
    session.setUseWrapMode(false);
    session.setMode("ace/mode/javascript");
    textEditor.editor.setValue("");
    const snippetCompleter = {
      getCompletions: function(editor, session, pos, prefix, callback) {
          const list = snippets.map((snippet, index) => ({
            caption: snippet.caption,
            snippet: snippet.value,
            docText: snippet.help,
            score: 1000 - index
          }));
          callback(null, list);
      }
    }
    textEditor.editor.completers = [snippetCompleter];
  },

  setReadOnly(readOnly) {
    textEditor.editor.setReadOnly(readOnly);
  },

  restore(player) {
    textEditor.editor.setValue(player.code, -1);
    textEditor.editor.focus();
  },

  getCode() {
    return textEditor.editor.getValue();
  },

  //Preserve functions for the next turn
  save(player, code) {
    player.code = textEditor.extractFunctions(code).join('\n\n');
  },

  extractFunctions(code) {
    const regex = /function\s+\w+\s*\([^)]*\)\s*\{/g;
    let match;
    const results = [];

    while ((match = regex.exec(code)) !== null) {
        let start = match.index;
        let pos = start + match[0].length;
        let count = 1;

        while (count > 0 && pos < code.length) {
            if (code[pos] === '{') count++;
            if (code[pos] === '}') count--;
            pos++;
        }
        results.push(code.slice(start, pos));
    }
    return results;
  },

  highlight(node) {
    textEditor.editor.selection.setRange(new ace.Range(node.O.start.line - 1, node.O.start.eb, node.O.end.line - 1, node.O.end.eb));
  },

  insertText(text, speed = 50, callback) {
    let index = 0;
    textEditor.show();
    textEditor.editor.setValue("");
    const session = textEditor.editor.session;
    session.setMode("ace/mode/text"); 
    session.setUseWrapMode(true);
    if(textEditor.editor.session.interval) clearInterval(textEditor.editor.session.interval);
    textEditor.editor.session.interval = setInterval(() => {
      if(index < text.length) {
        const ch = text[index];
        session.insert(textEditor.editor.getCursorPosition(), ch);
        index++;
      } else {
        clearInterval(textEditor.editor.session.interval);
        if(callback) callback();
      }
    }, speed);
  },
}

const blockEditor = {
  workspace: null,
  snippets: [],
  procedures: '',

  resize() {
    if(blockEditor.workspace) {
      Blockly.svgResize(blockEditor.workspace);
    }
  },

  show() {
    document.getElementById('editor').style.display = 'none';
    document.getElementById('blockly').style.display = '';
    ui.showModeHelp('block');
    if(blockEditor.workspace) {
      Blockly.svgResize(blockEditor.workspace);
    }
  },

  init() {
    defineBlocks();
    const theme = Blockly.Theme.defineTheme('animalcoding', {
      base: Blockly.Themes.Classic,
      componentStyles: {
       // workspaceBackgroundColour: '#002451',
//        flyoutBackgroundColour: '#00346e',
        flyoutOpacity: 1,
//        scrollbarColour: '#7285b7',
//        insertionMarkerColour: '#ffffff',
      },
      fontStyle: {family: 'Monaco, Menlo, Consolas, monospace'},
    });
    blockEditor.workspace = Blockly.inject('blockly', {
      toolbox: blockEditor.toolbox(),
      theme: theme,
      trashcan: true,
      comments: false,
      maxInstances: {when_run_code: 1},
      zoom: {controls: true, startScale: 0.8},
      move: {scrollbars: true, drag: true, wheel: true},
    });
    blockEditor.workspace.addChangeListener(blockEditor.updateToolbox);
    blockEditor.workspace.addChangeListener(Blockly.Events.disableOrphans);
    blockEditor.addStartBlock();
  },

  addStartBlock() {
    Blockly.serialization.blocks.append({type: 'when_run_code', x: 20, y: 20}, blockEditor.workspace);
  },

  //Build the flyout from the stage snippets, adding a call block for each function
  toolbox() {
    const contents = [];
    let hasCondition = false;
    for(const snippet of blockEditor.snippets) {
      if(snippet.block in CONDITION_BLOCKS) {
        //All conditions share the "if" and "if / else" blocks with a dropdown
        if(!hasCondition) contents.push({kind: 'block', type: 'if'}, {kind: 'block', type: 'if_else'});
        hasCondition = true;
      }
      else if(snippet.block === 'function') {
        contents.push({kind: 'block', type: 'procedures_defnoreturn'});
        for(const name of blockEditor.procedureNames()) {
          contents.push({kind: 'block', type: 'procedures_callnoreturn', extraState: {name: name}});
        }
      }
      else {
        contents.push({kind: 'block', type: snippet.block});
      }
    }
    return {kind: 'flyoutToolbox', contents: contents};
  },

  procedureNames() {
    if(!blockEditor.workspace) return [];
    return Blockly.Procedures.allProcedures(blockEditor.workspace)[0].map(procedure => procedure[0]);
  },

  updateToolbox(event) {
    if(event.isUiEvent) return;
    const procedures = blockEditor.procedureNames().join(',');
    if(procedures !== blockEditor.procedures) {
      blockEditor.procedures = procedures;
      blockEditor.workspace.updateToolbox(blockEditor.toolbox());
    }
  },

  loadStage(snippets) {
    blockEditor.snippets = snippets;
    blockEditor.procedures = '';
    if(!blockEditor.workspace) {
      blockEditor.init();
    }
    else {
      blockEditor.workspace.clear();
      blockEditor.addStartBlock();
      blockEditor.workspace.updateToolbox(blockEditor.toolbox());
    }
  },

  setReadOnly(readOnly) {
    blockEditor.workspace.highlightBlock(null);
    blockEditor.workspace.setIsReadOnly(readOnly);
  },

  restore(player) {
    blockEditor.workspace.clear();
    blockEditor.addStartBlock();
    for(const state of player.blocks) {
      Blockly.serialization.blocks.append(state, blockEditor.workspace);
    }
  },

  //Generate code only for the blocks under the start block, plus function definitions
  getCode() {
    const generator = javascript.javascriptGenerator;
    generator.init(blockEditor.workspace);
    let code = '';
    for(const block of blockEditor.workspace.getTopBlocks(true)) {
      if(block.type === 'when_run_code') {
        code += generator.blockToCode(block);
      }
      else if(block.type === 'procedures_defnoreturn') {
        generator.blockToCode(block);
      }
    }
    return generator.finish(code);
  },

  //Preserve function blocks for the next turn
  save(player, code) {
    player.blocks = blockEditor.workspace.getTopBlocks(true)
      .filter(block => block.type === 'procedures_defnoreturn')
      .map(block => Blockly.serialization.blocks.save(block));
  },

  //Blocks are highlighted by highlight_block() calls in the generated code
  highlight(node) {
  },

  highlightBlock(id) {
    blockEditor.workspace.highlightBlock(id);
  },
}
