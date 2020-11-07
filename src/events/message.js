const BaseEvent = require('../structures/BaseEvent');

class ReadyEvent extends BaseEvent {
  constructor() {
    super('message');
  }

  run(client, message) {
    if (message.channel.type == 'dm') {
      return client.emit('dmMessage', (client, message));
    }
    console.log(message.content);
  }
}

module.exports = ReadyEvent;