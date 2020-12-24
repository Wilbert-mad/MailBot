const BaseCommand = require('../structures/BaseCommand');
const { createHelpSatisfyer } = require('../events/dmMessage');
const { MessageEmbed } = require('discord.js');
const { stripIndent } = require('common-tags');
const validTypes = ['dm', 'chat'];

class Help extends BaseCommand {
  constructor() {
    super('help', 'misc', {
      aliases: ['h'],
      description: 'Tabal of all commands',
      usage: 'help [command] [\'dm\'|\'chat\']',
    });
  }

  run(client, message, [command, type]) {
    if (!type) type = 'chat'; 
    if (!validTypes.includes(type)) return message.channel.send('Invalid command search type!');
    const commands = new MessageEmbed();
    command == 'all' ? command = null : null;
    if (type === 'chat') {
      if (command) {
        const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
        commands.setAuthor(cmd.name).setDescription(stripIndent`
        **Description:** ${cmd.description}
        **Usage:** ${cmd.usage}
        **Aliases:** ${cmd.aliases.length ? cmd.aliases.map(a => Indent(a)) : 'No aliases available'}
        **Guild only:** ${cmd.guildOnly}
        **Owner:** ${cmd.owner}
        `);
      } else {
        commands.setDescription(client.commands.map((cmd) => Indent(cmd.name)));
      }
      return message.channel.send(commands);
    } else if (type === 'dm') {
      return message.channel.send(createHelpSatisfyer(command, client.dmCache, client.user.avatarURL()));
    } else {
      return message.channel.send('Invalid command search type!');
    }
  }
}

module.exports = Help;

const Indent = (str) => `\`${str}\``;