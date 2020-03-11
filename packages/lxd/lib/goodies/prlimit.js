// Generated by CoffeeScript 2.5.1
// # `nikita.lxd.goodies.prlimit`

// Print the process limit associated with a running container.

// ## Options

// * `container` (string, required)
//   The name of the container.

// ## Output

// * `error` (object)
//   The error object, if any.
// * `output.stdout` (string)
//   The standard output from the `prlimit` command.
// * `output.limits` (array)
//   The limit object parsed from `stdout`; each element of the array contains the
//   keys `resource`, `description`, `soft`, `hard` and `units`.

// ## Exemple

// ```js
// require('nikita')
// .lxd.goodies.prlimit({
//   container: "my_container"
// }, function(err, {stdout, limits}) {
//   console.info( err ? err.message : stdout + JSON.decode(limits))
// });
// ```
var string, validate_container_name;

module.exports = {
  shy: true,
  handler: function({options}, callback) {
    this.log({
      message: "Entering lxd.goodies.prlimit",
      level: 'DEBUG',
      module: '@nikitajs/lxd/lib/goodies/prlimit'
    });
    if (!options.container) {
      // Validation
      throw Error("Invalid Option: container is required");
    }
    validate_container_name(options.container);
    return this.system.execute({
      cmd: `command -p prlimit || exit 3
prlimit -p $(lxc info ${options.container} | awk '$1==\"Pid:\"{print $2}')`
    }, function(error, {code, stdout}) {
      var description, hard, i, limits, line, resource, soft, units;
      if (error && code === 3) {
        return callback(Error('Invalid Requirement: this action requires prlimit installed on the host'));
      }
      if (error) {
        return callback(error);
      }
      limits = (function() {
        var j, len, ref, results;
        ref = string.lines(stdout);
        results = [];
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          line = ref[i];
          if (i === 0) {
            continue;
          }
          [resource, description, soft, hard, units] = line.split(/\s+/);
          results.push({
            resource: resource,
            description: description,
            soft: soft,
            hard: hard,
            units: units
          });
        }
        return results;
      })();
      return callback(null, {
        stdout: stdout,
        limits: limits
      });
    });
  }
};

// ## Dependencies
string = require('@nikitajs/core/lib/misc/string');

validate_container_name = require('../misc/validate_container_name');
