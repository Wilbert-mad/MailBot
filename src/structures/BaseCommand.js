class BaseCommand {
  /**
	 * @param {string} name - command name 
	 * @param {string} category - command category
	 * @param {commandOptions} options - command options
	 */
  constructor(name, category, options = {}) {
    this.name = name;
    this.cooldown = options.cooldown;
    this.aliases = options.aliases || [];
    this.usage = options.usage || 'No usage provided.';
    this.description = options.description || 'No description provided.';
    this.category = category || 'misc';
    this.guildOnly = options.guildOnly || true;
    this.owner = options.owner || false;
    this.memberPermissions = options.memberPermissions || [];
  }
  
  async run(client, message, args) { // eslint-disable-line no-unused-vars, require-await
    throw new Error(`${this.constructor.name} doesn't have a run() method.`);
  }
}

module.exports = BaseCommand;

/**
 * @typedef {object} commandOptions
 * @property {number} [cooldown] Commands cooldown in secs
 * @property {string[]} aliases Commands aliases
 * @property {string} description Commands description
 * @property {string} usage Commands usage
 * @property {boolean} [guildOnly] Guild Only Command
 * @property {boolean} [owner] Owner Only Command
 * @property {import('discord.js').PermissionResolvable[]} memberPermissions Member permission needed
 */