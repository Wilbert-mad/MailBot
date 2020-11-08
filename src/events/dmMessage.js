const { MessageEmbed } = require('discord.js');
const BaseEvent = require('../structures/BaseEvent');

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
  }

  async run(client, message, user) {
    const userTicket = client.currentlyOpenTickets.get(user.id);
    const staffServer = await client.staffServer();
    const channel = await staffServer.channels.create(`${user.username}-${user.discriminator}`, {
      type: 'text',
      topic: `User ID: ${user.id}`,
      parent: setChannelLink(client, userTicket),
      nsfw: false,
    });
    userTicket.channelID = channel.id;
    const embed = new MessageEmbed()
      .setAuthor(user.tag, user.avatarURL({ dynamic: true }))
      .setColor('RANDOM')
      .setDescription(message.content)
      .setTimestamp();
    await (await channel.send(embed));

    const messageCollector = channel.createMessageCollector((m) => !m.author.bot);

    messageCollector.on('collect', (msg) => {
      const [cmdName] = msg.content.split(new RegExp(/\s+/));
      if (cmdName.toLowerCase() == 'mine') {
        userTicket.clamed = true;
        userTicket.clamerID = msg.author.id;
      }
      for (const v of client.currentlyOpenTickets.values()) {
        console.log(v);
      }
    });

    const DMChannelCollector = user.dmChannel.createMessageCollector((m) => !m.author.bot);

    DMChannelCollector.on('collect', (msg) => {
      const embed = new MessageEmbed()
        .setAuthor(user.tag, user.avatarURL({ dynamic: true }))
        .setDescription(msg)
        .setColor('RANDOM')
        .setFooter(`Message ID: ${msg.id}`)
        .setTimestamp();
      channel.send(embed);
    });
  }
}

module.exports = ReadyEvent;