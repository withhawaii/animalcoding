const BLOCK_COLORS = {
  start: 45,
  command: 160,
  loop: 120,
  condition: 210,
  function: 290,
}

const COMMAND_BLOCKS = {
  move_forward: 'move forward',
  turn_left: 'turn left',
  turn_right: 'turn right',
  pick_up: 'pick up',
  eat: 'eat',
  steal: 'steal',
  disarm: 'disarm',
}

//Conditions for the "if" block dropdown, keyed by snippet name
const CONDITION_BLOCKS = {
  if_path_ahead: {condition: 'path_ahead', label: 'path ahead'},
  if_path_to_the_left: {condition: 'path_to_the_left', label: 'path to the left'},
  if_path_to_the_right: {condition: 'path_to_the_right', label: 'path to the right'},
  if_trap_is_on: {condition: 'trap_is_on', label: 'trap is on'},
}

//Dropdown options limited to the conditions the current stage allows
function conditionOptions() {
  let names = blockEditor.snippets.map(snippet => snippet.block).filter(name => name in CONDITION_BLOCKS);
  if(names.length === 0) names = Object.keys(CONDITION_BLOCKS);
  return names.map(name => [CONDITION_BLOCKS[name].label, CONDITION_BLOCKS[name].condition]);
}

function defineBlocks() {
  const generator = javascript.javascriptGenerator;

  //Highlight each statement while the code runs
  generator.STATEMENT_PREFIX = 'highlight_block(%1);\n';
  generator.addReservedWords('highlight_block,log,' + Object.keys(COMMAND_BLOCKS).join(',') + ',' + Object.values(CONDITION_BLOCKS).map(c => c.condition).join(','));

  //Starting block: only blocks attached below it run, like Scratch's green flag
  Blockly.Blocks['when_run_code'] = {
    init() {
      this.appendDummyInput().appendField('When run code');
      this.setNextStatement(true);
      this.setColour(BLOCK_COLORS.start);
      this.setTooltip('Blocks attached below \nrun when you click Run Code');
      this.setDeletable(false);
      this.hat = 'cap';
    }
  };
  generator.forBlock['when_run_code'] = () => '';

  for(const name in COMMAND_BLOCKS) {
    Blockly.Blocks[name] = {
      init() {
        this.appendDummyInput().appendField(COMMAND_BLOCKS[name]);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(BLOCK_COLORS.command);
        this.setTooltip(SNIPPETS[name].help);
      }
    };
    generator.forBlock[name] = () => `${name}();\n`;
  }

  Blockly.Blocks['for'] = {
    init() {
      this.appendDummyInput()
        .appendField('repeat')
        .appendField(new Blockly.FieldNumber(10, 1, 100, 1), 'TIMES')
        .appendField('times');
      this.appendStatementInput('DO');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(BLOCK_COLORS.loop);
      this.setTooltip(SNIPPETS['for'].help);
    }
  };
  generator.forBlock['for'] = (block, generator) => {
    const times = block.getFieldValue('TIMES');
    const i = generator.nameDB_.getDistinctName('i', Blockly.Names.NameType.VARIABLE);
    const branch = generator.statementToCode(block, 'DO');
    return `for (var ${i} = 0; ${i} < ${times}; ${i}++) {\n${branch}}\n`;
  };

  //"if" and "if / else" blocks share the condition dropdown
  for(const name of ['if', 'if_else']) {
    Blockly.Blocks[name] = {
      init() {
        this.appendDummyInput()
          .appendField('if')
          .appendField(new Blockly.FieldDropdown(conditionOptions), 'CONDITION');
        this.appendStatementInput('DO');
        if(name === 'if_else') {
          this.appendDummyInput().appendField('else');
          this.appendStatementInput('ELSE');
        }
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(BLOCK_COLORS.condition);
        this.setTooltip(() => SNIPPETS['if_' + this.getFieldValue('CONDITION')].help);
      }
    };
    generator.forBlock[name] = (block, generator) => {
      const condition = block.getFieldValue('CONDITION');
      const branch = generator.statementToCode(block, 'DO');
      if(name === 'if_else') {
        const elseBranch = generator.statementToCode(block, 'ELSE');
        return `if (${condition}()) {\n${branch}} else {\n${elseBranch}}\n`;
      }
      return `if (${condition}()) {\n${branch}}\n`;
    };
  }

  //Use Blockly's function blocks without parameters, like the text-mode snippet
  Blockly.Msg.PROCEDURES_DEFNORETURN_TITLE = 'function';
  Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE = 'my_command';
  Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP = SNIPPETS['function'].help;
  const procedureInit = Blockly.Blocks['procedures_defnoreturn'].init;
  Blockly.Blocks['procedures_defnoreturn'].init = function() {
    procedureInit.call(this);
    this.setMutator(null);
    this.setColour(BLOCK_COLORS.function);
  };
  const callInit = Blockly.Blocks['procedures_callnoreturn'].init;
  Blockly.Blocks['procedures_callnoreturn'].init = function() {
    callInit.call(this);
    this.setColour(BLOCK_COLORS.function);
  };
}
