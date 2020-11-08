const BaseEvent = require('../structures/BaseEvent');

class ReadyEvent extends BaseEvent {
  constructor() {
    super('message');
  }

  async run(client, message) {
    if (message.channel.type == 'dm') {
      if (client.currentlyOpenTickets.has(message.author.id)) return;
      client.currentlyOpenTickets.set(message.author.id, {
        clamed: false,
        channelCategoryID: null,
        clamerID: null,
        channelID: null,
      });
      return client.emit('dmMessage', message, await client.users.fetch(message.author.id));
    }
    
    if (message.content.indexOf(client.prefix) !== 0) return;

    const [cmdName, ...args] = message.content.split(new RegExp(/\s+/));
  
    const command = client.commands.get(cmdName.toLowerCase().slice(client.prefix.length)) ||
      client.commands.get(client.aliases.get(cmdName.toLowerCase().slice(client.prefix.length)));
    
    try {
      await command.run(client, message, args);
    } catch (error) {
      console.log(`There was an error in ${command.name}: ${error.message || error}`);
    }
  }
}

module.exports = ReadyEvent;