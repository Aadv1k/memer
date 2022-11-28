const JSON5 = require('json5');
const {readFileSync} = require('fs');

module.exports = JSON5.parse(
  readFileSync(__dirname + "/../config.json")
);
