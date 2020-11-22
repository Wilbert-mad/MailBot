const BaseCommand = require('../structures/BaseCommand');

class Info extends BaseCommand {
  constructor() {
    super('info');
  }

  async run(client, message) {
    await message.channel.send('Getting Info...').then(async (m) => {
      await (m.edit('Got info on me!\nThis bot was made by The Mauve-Development Team\nXa_Puppet & Jonfirexbox'));
    });
  }
}

module.exports = Info;
