const { MessageEmbed, Collection } = require('discord.js');
const BaseEvent = require('../structures/BaseEvent');
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
  constructor() {
    super('dmMessage');

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
      const [cmdName, ...args] = msg.content.split(new RegExp(/\s+/));
      if (cmdName.toLowerCase() == 'mine') {
        userTicket.clamed = true;
        userTicket.clamerID = msg.author.id;
        return;
      }
      if (userTicket.clamerID && userTicket.clamerID == msg.author.id) {
        if (!cmdName) return;
        const subCommand = this.subcommands.get(cmdName.toLowerCase()) || 
          this.subcommands.get(this.subaliases.get(cmdName.toLowerCase()));

        if (subCommand.requireClosingCheck) {
          if (userTicket.closing) {
            const closingError = new MessageEmbed()
              .setDescription('This theater is currently closing would you like to cancel closing session?')
              .setAuthor(msg.client.user.username, msg.client.user.avatarURL())
              .setColor(theaterColor)
              .setTimestamp();
            const waitReaction = await msg.channel.send(closingError);
            try {
              await waitReaction.react('✔');
              await waitReaction.react('❌');
              const reactioResponse = await waitReaction.awaitReactions((reaction, user) => !user.bot, { time: 10000, error: ['time'] });
              if (reactioResponse.first().emoji == '✔') {
                userTicket.closing = false;
                return msg.channel.send('Theater closing');
              } else if (reactioResponse.first().emoji == '❌') {
                userTicket.closing = true;
                return msg.channel.send('Theater now opened');
              }
            } catch (error) {
              console.log(error);
              return msg.channel.send(`There was an error tyring to do this action: \n\`\`\`js\n${error}\n\`\`\``);
            }
          }
        }
        
        if (subCommand) {
          await subCommand.run(msg, args, user, 
            {
              theaterColor, 
              messageCollector,
              userTicket,
            }
          );
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
      requireClosingCheck: true,
      async run(msg, args, user, otherData) {
        const reply = new MessageEmbed()
          .setAuthor(msg.author.tag, msg.author.avatarURL({ dynamic: true }))
          .setDescription(args.join(' '))
          .setColor(otherData.theaterColor)
          .setFooter(`Message ID: ${msg.id}`)
          .setTimestamp();
        await user.send(reply).then(m => m.delete({ timeout: 10000 }));
        await msg.channel.send(reply);
      }
    });
    // replay anonymous to theater
    this.subcommands.set('anonymous-reply', {
      aliases: ['ar'],
      requireClosingCheck: true,
      async run(msg, args, user, otherData) {
        const reply = new MessageEmbed()
          .setAuthor(msg.client.user.username, msg.client.user.avatarURL())
          .setDescription(args.join(' '))
          .setColor(otherData.theaterColor)
          .setFooter(`Message ID: ${msg.id}`)
          .setTimestamp();
        await user.send(reply).then(m => m.delete({ timeout: 10000 }));
        await msg.channel.send(reply);
      }
    });

    // close the theater
    this.subcommands.set('close', {
      aliases: ['c'],
      run(msg, [time], user, otherData) {
        if (!otherData.userTicket.closing) {
          msg.channel.send('Theater has started closing');
          otherData.userTicket.closing = true;
          if (!time) time = '1h';
          setTimeout(() => {
            otherData.messageCollector.stop('requested');
          }, ms(time));
        } else {
          return msg.channel.send('This Theater is already closing');
        }
      }
    });

    this.subcommands.set('delete', {
      aliases: ['del'],
      async run(msg, [ID], user) {
        const dmMessages = user.dmChannel.messages.cache;
        const message = dmMessages.get(ID);
        if (message && message.author.id == msg.client.user.id) {
          await message.delete();
          return await msg.channel.send(`Message hase been deleted. content: ${message.content} (${message.id})`);
        } else {
          return await msg.channel.send('This message is not found or not yours!');
        }
      }
    });

    // tranfer theater
    this.subcommands.set('~tranfer-theater', {
      aliases: ['~tt'],
      run(msg, args, user, otherData) {
        const newUser = msg.mentions.users.first() || msg.client.users.fetch(args[0]);
        otherData.userTicket.clamerID = newUser.id;
        return msg.channel.send(`New theater owner set as ${user.tag} (${user.id})`);
      }
    });

    // tranfer data
    this.subcommands.set('~theater-data', {
      aliases: ['~data', '~td'],
      run(msg, args, user, otherData) {
        msg.channel.send(JSON.stringify(Object.assign({ 
          theaterColor: otherData.theaterColor
        }, otherData.userTicket), null, 4), 
        { 
          code: 'js',
        }
        );
      }
    });
  }

  setTheaterColor(ticket) {
    const colors = ['#7B7BF'];
    ticket.theaterColor = colors[Math.floor(Math.random() * colors.length)];
  }
}

module.exports = DmMessageEvent;