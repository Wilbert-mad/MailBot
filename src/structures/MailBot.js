const { Client } = require('discord.js');
const { PREFIX, MONGO_URL, OWNERS, STAFFSERVER } = require('../../configs');
const { connect, connection } = require('mongoose');
const Registrator = require('../utils/Registrator');
const serverSchema = require('../models/serverSchema');

class MailBot extends Client {
  constructor(options = {}) {
    super(options);

    this.Registrator = new Registrator(this);

    this.currentlyOpenTickets = new Map();
  }

  get prefix() {
    return PREFIX || '!';
  }

  get owners() {
    return OWNERS;
  }

  get staffServer() {
    return this.guilds.fetch(STAFFSERVER);
  }

  async database() {
    return await this._getMaster();
  }

  ready(token) {
    connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    connection.on('connected', async () => {
      console.log('DB connected');
      await this._getMaster();
    });
    this.Registrator.loadCommands('../commands');
    this.Registrator.loadEvents('../events');
    super.login(token);
  }

  /** @private */
  async _getMaster() {
    const master = await serverSchema.findOne({ main: 'master' });
    if (!master) {
      const masterCreated = new serverSchema();
      await masterCreated.save();
      return masterCreated;
    }
    return master;
  }
}

module.exports = MailBot;