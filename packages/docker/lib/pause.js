// Generated by CoffeeScript 2.5.1
// # `nikita.docker.pause`

// Pause all processes within a container.

// ## Options

// * `boot2docker` (boolean)   
//   Whether to use boot2docker or not, default to false.   
// * `container` (string)   
//   Name/ID of the container, required.
// * `machine` (string)   
//   Name of the docker-machine, required.
// * `code` (int|array)   
//   Expected code(s) returned by the command, int or array of int, default to 0.
// * `code_skipped`   
//   Expected code(s) returned by the command if it has no effect, executed will
//   not be incremented, int or array of int.

// ## Callback parameters

// * `err`   
//   Error object if any.
// * `status`   
//   True if container was pulled.

// ## Example

// ```javascript
// require('nikita')
// .docker.pause({
//   container: 'toto'
// }, function(err, {status}){
//   console.log( err ? err.message : 'Container paused: ' + status);
// })
// ```

// ## Source Code
var docker, util;

module.exports = function({options}, callback) {
  var k, ref, v;
  this.log({
    message: "Entering Docker pause",
    level: 'DEBUG',
    module: 'nikita/lib/docker/pause'
  });
  // Global parameters
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
    return callback(Error('Missing container parameter'));
  }
  return this.system.execute({
    cmd: docker.wrap(options, `pause ${options.container}`)
  }, docker.callback);
};

// ## Modules Dependencies
docker = require('@nikitajs/core/lib/misc/docker');

util = require('util');
