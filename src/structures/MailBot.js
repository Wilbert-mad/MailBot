const { Client } = require('discord.js');
const { PREFIX } = require('../../configs');
const Registrator = require('../utils/Registrator');

class MailBot extends Client {
  constructor(options = {}) {
    super(options);
  }

  get prefix() {
    return PREFIX || '!';
  }

  ready(token) {
    Registrator.loadCommands('../commands');
    Registrator.loadEvents('../events');
    super.login(token);
  }
}

module.exports = MailBot;