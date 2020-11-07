const { model, Schema } = require('mongoose');

module.exports = model('server', new Schema({
  main: {
    type: String,
    default: 'master'
  },
  departments: {
    type: Array,
    default: []
  },
  Snippets: {
    type: Array,
    default: []
  }
}));