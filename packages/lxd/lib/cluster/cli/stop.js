// Generated by CoffeeScript 2.5.0
var nikita;

nikita = require('nikita');

module.exports = function({params}) {
  return nikita({
    debug: params.debug
  }).system.execute({
    debug: params.debug,
    cwd: `${__dirname}/../../../assets`,
    cmd: `vagrant halt`
  });
};