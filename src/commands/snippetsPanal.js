const BaseCommand = require('../structures/BaseCommand');

class SnippetsPanal extends BaseCommand {
  constructor() {
    super('snippetspanal', 'db', {
      usage: 'snippet (add|create|remove) [...context]',
    });
  }
}

module.exports = SnippetsPanal;
