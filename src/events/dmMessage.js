const BaseEvent = require('../structures/BaseEvent');

class ReadyEvent extends BaseEvent {
  constructor() {
    super('dmMessage');
  }

  run(client, message) {
    if (message.channel.type !== 'dm') return;
    console.log(message.content);
  }
}

module.exports = ReadyEvent;