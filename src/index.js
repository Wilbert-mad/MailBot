const { TOKEN } = require('./config');
const MailBot = require('./structures/MailBot');
const client = new MailBot();

client.ready(TOKEN);
