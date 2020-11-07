const BaseEvent = require('../structures/BaseEvent');

class ReadyEvent extends BaseEvent {
  constructor() {
    super('ready');
  }

  run(client) {
    console.log(`${client.user.tag} is ready.`);
    client.user.setActivity(`people in my DMs 🍁`);
  }
}

module.exports = ReadyEvent;
