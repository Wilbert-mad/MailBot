const { TOKEN } = require('../configs');
const MailBot = require('./structures/MailBot');
const client = new MailBot();

client.login(TOKEN);