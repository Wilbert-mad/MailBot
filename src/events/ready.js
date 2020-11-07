const BaseEvent = require('../structures/BaseEvent');

class ReadyEvent extends BaseEvent {
  constructor() {
    super('ready');
  }

  run() {
    console.log('ready');
  }
}

module.exports = ReadyEvent;