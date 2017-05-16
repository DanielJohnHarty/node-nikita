// Generated by CoffeeScript 1.12.5
module.exports = function(options, callback) {
  options.log({
    message: "Entering ping",
    level: 'DEBUG',
    module: 'nikita/lib/assert'
  });
  if (options.content == null) {
    options.content = 'pong';
  }
  return setImmediate(function() {
    options.log({
      message: "Sending " + options.content,
      level: 'DEBUG',
      module: 'nikita/lib/assert'
    });
    return callback(null, true, options.content);
  });
};