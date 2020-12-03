const { MessageEmbed, Collection } = require('discord.js');
const BaseEvent = require('../structures/BaseEvent');
const { stripIndents, oneLine } = require('common-tags');
const ms = require('ms');

const setChannelLink = (client, userTicket, newParent = null) => {
  let id = '';
  if (!userTicket.channelCategoryID) {
    userTicket.channelCategoryID = id = client.mainParent;
  } else if (newParent) {
    userTicket.channelCategoryID = id = newParent;
  }
  return id;
};

class DmMessageEvent extends BaseEvent {
  constructor(client) {
    super('dmMessage');

    this.client = client;
    /**
     * logic was taken from Wilbert-mad's RinBot configs command
     * {@link https://github.com/Wilbert-mad/RinBot/blob/master/Bot/src/commands/misc/configs.js}
     */
    this.subcommands = new Collection();
    this.subaliases = new Collection();

    this.registerSubCommands();

    for (const [k, v] of this.subcommands) {
      for (const a of v.aliases) {
        this.subaliases.set(a, k);
      }
    }

    this.client.dmCache = this.client.dmCache.concat(this.subcommands);
  }

  async run(client, message, user) {
    if (user.id == client.user.id) return;
    const userTicket = client.currentlyOpenTickets.get(user.id);
    this.setTheaterColor(userTicket);
    const { theaterColor } = userTicket;
    const staffServer = await client.staffServer();
    // create channel for messanger
    const channel = await staffServer.channels.create(`${user.username}-${user.discriminator}`, {
      type: 'text',
      topic: `User ID: ${user.id}`,
      parent: setChannelLink(client, userTicket),
      nsfw: false,
    });
    // set channel id and sand message to channel
    userTicket.channelID = channel.id;
    const embed = new MessageEmbed()
      .setAuthor(user.tag, user.avatarURL({ dynamic: true }))
      .setColor(theaterColor)
      .setDescription(message.content)
      .setFooter(`Message ID: ${message.id}`)
      .setTimestamp();
    await channel.send(embed);

    const messageCollector = channel.createMessageCollector((m) => !m.author.bot);
    // collect server sided messages
    messageCollector.on('collect', async (msg) => {
      const [cmdName, ...args] = msg.content.split(new RegExp(/\s+/g));
      if (cmdName.toLowerCase() == 'mine') {
        userTicket.clamed = true;
        userTicket.clamerID = msg.author.id;
        return msg.channel.send(`Theater clamer set to, ${msg.author.tag} (${msg.author.id})`);
      }
      if (userTicket.clamerID) {
        if (!cmdName) return;
        const subCommand = this.subcommands.get(cmdName.toLowerCase()) || this.subcommands.get(this.subaliases.get(cmdName.toLowerCase()));

        if (!subCommand.requireClosingCheck) subCommand.requireClosingCheck = false;
        if (subCommand.requireClosingCheck) {
          if (userTicket.closing) {
            const reactionHolder = await msg.channel.send(oneLine`
            This theater is currently closing would you like to cancel closing session?
            `);
            try {
              await reactionHolder.react('✔');
              await reactionHolder.react('❌');
              const reactioResponse = await reactionHolder.awaitReactions((reaction, user) => !user.bot, { time: 10000, error: ['time'] }).first();
              if (reactioResponse.emoji == '✔') {
                userTicket.closing = false;
                return msg.channel.send('Theater closing');
              } else if (reactioResponse.emoji == '❌') {
                userTicket.closing = true;
                return msg.channel.send('Theater now opened');
              }
            } catch (error) {
              console.log(error);
              return msg.channel.send(`There was an error tyring to do this action: \n\`\`\`js\n${error}\n\`\`\``);
            }
          }
        }

        if (subCommand.clamerOnly && userTicket.clamerID !== msg.author.id) return;

        if (subCommand) {
          await subCommand.run(msg, args, user, {
            theaterColor,
            messageCollector,
            userTicket,
            staffServer,
            subcommands: this.subcommands,
          });
        }
      }
    });

    const DMChannelCollector = user.dmChannel.createMessageCollector((m) => !m.author.bot);
    // collect user sided messages
    DMChannelCollector.on('collect', async (msg) => {
      const embed = new MessageEmbed()
        .setAuthor(user.tag, user.avatarURL({ dynamic: true }))
        .setDescription(msg)
        .setColor(theaterColor)
        .setFooter(`Message ID: ${msg.id}`)
        .setTimestamp();
      await channel.send(embed);
    });
  }

  registerSubCommands() {
    // replay to theater
    this.subcommands.set('reply', {
      aliases: ['r'],
      clamerOnly: true,
      requireClosingCheck: true,
      async run(msg, args, user, otherData) {
        const reply = new MessageEmbed()
          .setAuthor(msg.author.tag, msg.author.avatarURL({ dynamic: true }))
          .setDescription(args.join(' '))
          .setColor(otherData.theaterColor)
          .setFooter(`Message ID: ${msg.id}`)
          .setTimestamp();
        await user.send(reply);
        await msg.channel.send(reply);
      },
    });
    // replay anonymous to theater
    this.subcommands.set('anonymous-reply', {
      aliases: ['ar'],
      clamerOnly: true,
      requireClosingCheck: true,
      async run(msg, args, user, otherData) {
        const reply = new MessageEmbed()
          .setAuthor(msg.client.user.username, msg.client.user.avatarURL())
          .setDescription(args.join(' '))
          .setColor(otherData.theaterColor)
          .setFooter(`Message ID: ${msg.id}`)
          .setTimestamp();
        await user.send(reply);
        await msg.channel.send(reply);
      },
    });

    // close the theater
    this.subcommands.set('close', {
      aliases: ['c'],
      clamerOnly: true,
      run(msg, [time], user, otherData) {
        if (!otherData.userTicket.closing) {
          msg.channel.send('Theater has started closing');
          otherData.userTicket.closing = true;
          if (!time) time = '1h';
          msg.client.setTimeout(async () => {
            const channel = otherData.staffServer.channels.cache.get(otherData.userTicket.channelID);
            await channel.delete();
            otherData.messageCollector.stop('requested');
          }, ms(time));
        } else {
          return msg.channel.send('This Theater is already closing');
        }
      },
    });

    this.subcommands.set('delete', {
      aliases: ['del'],
      clamerOnly: true,
      async run(msg, [ID], user) {
        // TODO: fix get message and filter off user messages from dm's
        const dmMessages = user.dmChannel.messages.cache;
        const message = dmMessages.get(ID);
        console.log(dmMessages);
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        console.log(message);
        if (message && message.author.id == msg.client.user.id) {
          await message.delete();
          return await msg.channel.send(`Message hase been deleted. content: ${message.content} (${message.id})`);
        } else {
          return await msg.channel.send('This message is not found or not yours!');
        }
      },
    });

    this.subcommands.set('edit', {
      aliases: [],
      clamerOnly: true,
      async run(msg, [ID, ...args], user) {
        // TODO: fix get message and filter off user messages from dm's
        const dmMessages = user.dmChannel.messages.cache;
        const message = dmMessages.get(ID);
        console.log(dmMessages);
        console.log(message);
        if (message && message.author.id == msg.client.user.id) {
          await message.edit(args.join(' '));
        } else {
          return await msg.channel.send('This message is not found or not yours!');
        }
      },
    });

    // tranfer theater
    this.subcommands.set('~tranfer-theater', {
      aliases: ['~tt'],
      clamerOnly: true,
      run(msg, args, user, otherData) {
        const newUser = msg.mentions.users.first() || msg.client.users.fetch(args[0]);
        otherData.userTicket.clamerID = newUser.id;
        return msg.channel.send(`New theater owner set. ${newUser.tag} (${newUser.id})`);
      },
    });

    // tranfer data
    this.subcommands.set('~theater-data', {
      aliases: ['~data', '~td'],
      run(msg, args, user, otherData) {
        const datastring = JSON.stringify(
          Object.assign(
            {
              theaterColor: otherData.theaterColor,
            },
            otherData.userTicket
          ),
          null,
          4
        );
        msg.channel.send(datastring, {
          code: 'js',
        });
      },
    });

    this.subcommands.set('help', {
      aliases: ['h'],
      async run(msg, [command], user, otherData) {
        const commandOrCommands = createHelpSatisfyer(command, otherData.subcommands, msg.client.user.avatarURL());
        await msg.channel.send(commandOrCommands);
      },
    });

    this.subcommands.set('test', {
      aliases: [],
      run(msg, [ID], user) {
        //* falowing for test feching user dm messages
        const message = user.dmChannel.messages.cache.get(ID);
        const ms = message.channel.messages;
        console.log(message);
        console.log('~~~~~~~~~~~~~~~~~~~~~~');
        console.log(ms);
      },
    });
  }

  setTheaterColor(ticket) {
    const colors = ['#7B7BF'];
    ticket.theaterColor = colors[Math.floor(Math.random() * colors.length)];
  }
}

const createHelpSatisfyer = (command, subcommands, img) => {
  const embed = new MessageEmbed().setThumbnail(img).setDescription(oneLine`
    Failed to generate commands list or this commands is not found as a valid commands/aliases command.
    `);
  const helpCommands = [];
  if (!command) {
    for (const [name, value] of subcommands) {
      helpCommands.push(stripIndents`
      __**Name:** ${name}__
      **Aliases:** ${value.aliases.length ? value.aliases.map((a) => Indent(a)).join(', ') : 'No aliases for this command'}\n
      **Clamer only:** ${value.clamerOnly ? 'Require' : 'Not require'}
      `);
    }
    embed.setDescription(helpCommands.join('\n\n'));
  } else {
    for (const [name, value] of subcommands) {
      if (name === command || value.aliases.includes(command)) {
        embed.setDescription(stripIndents`
        __**Name: **__ ${name}
        **Aliases:** ${value.aliases.length ? value.aliases.map((a) => Indent(a)).join(', ') : 'No aliases for this command'}\n
        **Clamer only:** ${value.clamerOnly ? 'Require' : 'Not require'}
        `);
        break;
      }
      continue;
    }
  }
  return embed;
};

module.exports = DmMessageEvent;
module.exports.createHelpSatisfyer = createHelpSatisfyer;

function Indent(str) {
  return `\`${str}\``;
}
