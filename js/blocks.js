const BLOCK_COLORS = {
  start: 45,
  command: 160,
  loop: 120,
  condition: 210,
  function: 290,
}

//Block labels follow the text-mode code so students can move between the two modes
const COMMAND_BLOCKS = ['move_forward', 'turn_left', 'turn_right', 'pick_up', 'eat', 'steal', 'disarm'];

//Conditions for the "if" block dropdown, keyed by snippet name
const CONDITION_BLOCKS = {
  if_path_ahead: 'path_ahead',
  if_path_to_the_left: 'path_to_the_left',
  if_path_to_the_right: 'path_to_the_right',
  if_trap_is_on: 'trap_is_on',
}

//Dropdown options limited to the conditions the current stage allows
function conditionOptions() {
  let names = blockEditor.snippets.map(snippet => snippet.block).filter(name => name in CONDITION_BLOCKS);
  if(names.length === 0) names = Object.keys(CONDITION_BLOCKS);
  return names.map(name => [CONDITION_BLOCKS[name], CONDITION_BLOCKS[name]]);
}

function defineBlocks() {
  const generator = javascript.javascriptGenerator;

  //Highlight each statement while the code runs
  generator.STATEMENT_PREFIX = 'highlight_block(%1);\n';
  generator.addReservedWords('highlight_block,log,' + COMMAND_BLOCKS.join(',') + ',' + Object.values(CONDITION_BLOCKS).join(','));

  //Starting block: only blocks attached below it run, like Scratch's green flag
  Blockly.Blocks['when_run_code'] = {
    init() {
      this.appendDummyInput().appendField('When Run');
      this.setNextStatement(true);
      this.setColour(BLOCK_COLORS.start);
      this.setTooltip('Blocks attached below \nrun when you click Run Code');
      this.setDeletable(false);
      this.hat = 'cap';
    }
  };
  generator.forBlock['when_run_code'] = () => '';

  for(const name of COMMAND_BLOCKS) {
    Blockly.Blocks[name] = {
      init() {
        this.appendDummyInput().appendField(`${name}();`);
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
        .appendField('for(i=0; i<')
        .appendField(new Blockly.FieldNumber(10, 1, 100, 1), 'TIMES')
        .appendField('; i++) {');
      this.appendStatementInput('DO');
      this.appendDummyInput().appendField('}');
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
          .appendField('if(')
          .appendField(new Blockly.FieldDropdown(conditionOptions), 'CONDITION')
          .appendField(') {');
        this.appendStatementInput('DO');
        if(name === 'if_else') {
          this.appendDummyInput().appendField('} else {');
          this.appendStatementInput('ELSE');
        }
        this.appendDummyInput().appendField('}');
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
    this.inputList[0].appendField('() {');
    this.appendDummyInput().appendField('}');
    this.setColour(BLOCK_COLORS.function);
  };
  const callInit = Blockly.Blocks['procedures_callnoreturn'].init;
  Blockly.Blocks['procedures_callnoreturn'].init = function() {
    callInit.call(this);
    this.getInput('TOPROW').appendField('();');
    this.setColour(BLOCK_COLORS.function);
  };
}
