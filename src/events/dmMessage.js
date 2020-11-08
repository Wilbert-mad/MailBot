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

class ReadyEvent extends BaseEvent {
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
    await (await channel.send(embed));

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
        if (subCommand) {
          await subCommand.run(msg, args, user, theaterColor);
        }
      }
    });

    const DMChannelCollector = user.dmChannel.createMessageCollector((m) => !m.author.bot);
    // collect user sided messages
    DMChannelCollector.on('collect', (msg) => {
      const embed = new MessageEmbed()
        .setAuthor(user.tag, user.avatarURL({ dynamic: true }))
        .setDescription(msg)
        .setColor(theaterColor)
        .setFooter(`Message ID: ${msg.id}`)
        .setTimestamp();
      channel.send(embed);
    });
  }

  registerSubCommands() {
    // replay to theater
    this.subcommands.set('reply', {
      aliases: ['r'],
      async run(msg, args, user, ...otherDate) {
        const reply = new MessageEmbed()
          .setAuthor(msg.author.tag, msg.author.avatarURL({ dynamic: true }))
          .setDescription(args.join(' '))
          .setColor(otherDate.theaterColor)
          .setTimestamp();
        await user.send(reply).then(m => m.delete({ timeout: 10000 }));
      }
    });
    // replay anonymous to theater
    this.subcommands.set('anonymous-reply', {
      aliases: ['ar'],
      async run(msg, args, user, ...otherDate) {
        const reply = new MessageEmbed()
          .setAuthor(msg.client.user.username, msg.client.user.avatarURL())
          .setDescription(args.join(' '))
          .setColor(otherDate.theaterColor)
          .setTimestamp();
        await user.send(reply).then(m => m.delete({ timeout: 10000 }));
      }
    });

    this.subcommands.set('close', {
      aliases: ['c'],
      async run(msg, [time], user, ...otherData) {
        msg.channel.send('Theater hase started closing');
        console.log(ms(time));
        console.log(ms(ms(time)));
        // setTimeout(() => {

        // }, );
      }
    });
  }

  setTheaterColor(ticket) {
    const colors = ['#7B7BF'];
    ticket.theaterColor = colors[Math.floor(Math.random() * colors.length)];
  }
}

module.exports = ReadyEvent;