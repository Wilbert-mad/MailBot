const { Client } = require('discord.js');

class MailBot extends Client {
  constructor(options = {}) {
    super(options);
  }
}

module.exports = MailBot;