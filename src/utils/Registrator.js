const fs = require('fs').promises;
const path = require('path');
const BaseEvent = require('../structures/BaseEvent');
const BaseCommand = require('../structures/BaseCommand');

class Registrator {
  constructor(client) {
    Object.defineProperty(this, 'client', { value: client });
  }

  async loadCommands(dir = '') {
    const filePath = path.join(__dirname, dir);
    const files = await fs.readdir(filePath);
    for (const file of files) {
      if (file.endsWith('.js')) {
        const Command = require(path.join(filePath, file));
        if (Command.prototype instanceof BaseCommand) {
          const command = new Command();
          this.client.commands.set(command.name, command);
          command.aliases.forEach(alias => {
            this.client.aliases.set(alias, command.name);
          });
        }
      }
    }
  }

  async loadEvents(dir = '') {
    const filePath = path.join(__dirname, dir);
    const files = await fs.readdir(filePath);
    for (const file of files) {
      if (file.endsWith('.js')) {
        const Event = require(path.join(filePath, file));
        if (Event.prototype instanceof BaseEvent) {
          const event = new Event();
          this.client.on(event.name, event.run.bind(event, this.client));
        }
      }
    }
  }
}

module.exports = Registrator;