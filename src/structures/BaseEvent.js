module.exports = class BaseEvent {
  constructor(name) {
    this.name = name;
  }

  async run(client) { // eslint-disable-line no-unused-vars, require-await
    throw new Error(`Error: '${this.name}' has no run function!`);
  }
};