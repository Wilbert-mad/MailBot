const BaseEvent = require('../structures/BaseEvent');

class ReadyEvent extends BaseEvent {
  constructor() {
    super('ready');
  }

  run(client) {
    console.log(`${client.user.tag} is ready.`);
  }
}

module.exports = ReadyEvent;