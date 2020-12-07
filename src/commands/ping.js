const BaseCommand = require('../structures/BaseCommand');

class Ping extends BaseCommand {
  constructor() {
    super('ping');
  }

  async run(client, message) {
    const startTime = Date.now();
    await message.channel.send('Pinging...').then(async (m) => {
      const endTime = Date.now();
      await (m.edit(`Pong! \`${endTime - startTime}ms\``));
    });
  }
}

module.exports = Ping;