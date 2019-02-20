// Generated by CoffeeScript 2.3.2
// # `nikita.docker.stop`

// Stop a started container.

// ## Options

// * `boot2docker` (boolean)   
//   Whether to use boot2docker or not, default to false.
// * `container` (string)   
//   Name/ID of the container, required.
// * `machine` (string)   
//   Name of the docker-machine, required if using docker-machine.
// * `timeout` (int)   
//   Seconds to wait for stop before killing it

// ## Callback parameters

// * `err`   
//   Error object if any.
// * `status`   
//   True unless container was already stopped.

// ## Example

// ```javascript
// require('nikita')
// .docker.stop({
//   container: 'toto'
// }, function(err, {status}){
//   console.log( err ? err.message : 'Container state changed to stopped: ' + status);
// })
// ```

// ## Source Code
var docker, util;

module.exports = function({options}) {
  var cmd, k, ref, v;
  this.log({
    message: "Entering Docker stop",
    level: 'DEBUG',
    module: 'nikita/lib/docker/stop'
  });
  // Global options
  if (options.docker == null) {
    options.docker = {};
  }
  ref = options.docker;
  for (k in ref) {
    v = ref[k];
    if (options[k] == null) {
      options[k] = v;
    }
  }
  if (options.container == null) {
    // Validate parameters
    throw Error('Missing container parameter');
  }
  // rm is false by default only if options.service is true
  cmd = 'stop';
  if (options.timeout != null) {
    cmd += ` -t ${options.timeout}`;
  }
  cmd += ` ${options.container}`;
  this.docker.status({
    shy: true
  }, options, function(err, {status}) {
    if (err) {
      throw err;
    }
    if (status) {
      this.log({
        message: `Stopping container ${options.container}`,
        level: 'INFO',
        module: 'nikita/lib/docker/stop'
      });
    } else {
      this.log({
        message: `Container already stopped ${options.container} (Skipping)`,
        level: 'INFO',
        module: 'nikita/lib/docker/stop'
      });
    }
    if (!status) {
      return this.end();
    }
  });
  return this.system.execute({
    cmd: docker.wrap(options, cmd)
  }, docker.callback);
};

// ## Modules Dependencies
docker = require('@nikitajs/core/lib/misc/docker');

util = require('util');