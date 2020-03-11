// Generated by CoffeeScript 2.5.1
// # `nikita.docker.rm`

// Remove one or more containers. Containers need to be stopped to be deleted unless
// force options is set.

// ## Options

// * `boot2docker` (boolean)   
//   Whether to use boot2docker or not, default to false.
// * `container` (string)   
//   Name/ID of the container, required.
// * `machine` (string)   
//   Name of the docker-machine, required if docker-machine installed.
// * `link` (boolean)   
//   Remove the specified link.
// * `volumes` (boolean)   
//   Remove the volumes associated with the container.
// * `force` (boolean)   
//   Force the removal of a running container (uses SIGKILL).

// ## Callback parameters

// * `err`   
//   Error object if any.
// * `status`   
//   True if container was removed.

// ## Example Code

// ```javascript
// require('nikita')
// .docker.rm({
//   container: 'toto'
// }, function(err, status){
//   console.log( err ? err.message : 'Container removed: ' + status);
// })
// ```

// ## Source Code
var docker;

module.exports = function({options}) {
  var cmd, k, opt, ref, v;
  this.log({
    message: "Entering Docker rm",
    level: 'DEBUG',
    module: 'nikita/lib/docker/rm'
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
    // Validate parameters and madatory conditions
    return callback(Error('Missing container parameter'));
  }
  cmd = (function() {
    var i, len, ref1, results;
    ref1 = ['link', 'volumes', 'force'];
    results = [];
    for (i = 0, len = ref1.length; i < len; i++) {
      opt = ref1[i];
      if (options[opt]) {
        results.push(`-${opt.charAt(0)}`);
      } else {
        results.push(void 0);
      }
    }
    return results;
  })();
  cmd = `rm ${cmd.join(' ')} ${options.container}`;
  this.system.execute({
    cmd: docker.wrap(options, `ps | grep '${options.container}'`),
    code_skipped: 1
  }, (err, {status}) => {
    if (status && !options.force) {
      throw Error('Container must be stopped to be removed without force', null);
    }
  });
  this.system.execute({
    cmd: docker.wrap(options, `ps -a | grep '${options.container}'`),
    code_skipped: 1
  }, docker.callback);
  return this.system.execute({
    cmd: docker.wrap(options, cmd),
    if: function() {
      return this.status(-1);
    }
  }, docker.callback);
};

// ## Modules Dependencies
docker = require('@nikitajs/core/lib/misc/docker');
