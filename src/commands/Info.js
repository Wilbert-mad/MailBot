const BaseCommand = require('../structures/BaseCommand');

class Ping extends BaseCommand {
  constructor() {
    super('info');
  }

  async run(client, message) {
      message.channel.send('This bot was made by The Mauve-Development Teamn/Xa_Puppet & Jonfirexbox')
    });
  }
}

module.exports = Info;
