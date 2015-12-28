// Generated by CoffeeScript 1.10.0
module.exports = function(options, callback) {
  if (!options.name) {
    return callback(new Error("Missing required option 'name'"));
  }
  return this.execute({
    cmd: "service " + options.name + " restart"
  }, function(err, restarted) {
    if (err) {
      return callback(err);
    }
    if (restarted) {
      options.store["mecano.service." + options.name + ".status"] = 'started';
    }
    return callback(null, restarted);
  }).then(callback);
};