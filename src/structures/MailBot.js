const { Client } = require('discord.js');
const { PREFIX } = require('../../configs');
const Registrator = require('../utils/Registrator');

class MailBot extends Client {
  constructor(options = {}) {
    super(options);

    this.Registrator = new Registrator(this);
  }

  get prefix() {
    return PREFIX || '!';
  }

  ready(token) {
    this.Registrator.loadCommands('../commands');
    this.Registrator.loadEvents('../events');
    super.login(token);
  }
}

module.exports = MailBot;