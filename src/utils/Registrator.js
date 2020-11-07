const fs = require('fs').promises;
const path = require('path');

class Registrator {
  static async loadCommands(dir = '') {
    const filePath = path.join(__dirname, dir);
    const files = await fs.readdir(filePath);
    console.log(files);
  }

  static async loadEvents(dir = '') {
    const filePath = path.join(__dirname, dir);
    const files = await fs.readdir(filePath);
    console.log(files);
  }
}

module.exports = Registrator;