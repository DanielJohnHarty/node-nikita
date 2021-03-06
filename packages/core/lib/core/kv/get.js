// Generated by CoffeeScript 2.5.1
// # `nikita.kv.get`

// ## Source Code
module.exports = {
  shy: true,
  handler: function({options}, callback) {
    this.log({
      message: "Entering kv get",
      level: 'DEBUG',
      module: 'nikita/lib/core/kv/get'
    });
    if (options.engine && this.options.kv) {
      throw Error("Engine already defined");
    }
    if (!options.engine && !this.options.kv) {
      throw Error("No engine defined");
    }
    return this.options.kv.get(options.key, function(err, value) {
      return callback(err, {
        status: true,
        key: options.key,
        value: value
      });
    });
  }
};
