// Generated by CoffeeScript 2.4.1
// # `nikita.lxd.exec`

// Push files into containers.

// ## Options

// * `name` (string, required)   
//   The name of the container.
// * `cmd` (string, required)   
//   The command to execute.

// ## Example

// ```
// require('nikita')
// .lxd.exec({
//   name: "my-container"
//   cmd: "whoami"
// }, function(err, {status, stdout, stderr}) {
//   console.log( err ? err.message : stdout)
// });

// ```

// ## Todo

// * Support `env` option

// ## Source Code
module.exports = function({options}, callback) {
  this.log({
    message: "Entering lxd.exec",
    level: 'DEBUG',
    module: '@nikitajs/lxd/lib/exec'
  });
  if (!options.name) {
    throw Error("Invalid Option: name is required");
  }
  return this.system.execute(options, {
    trap: false
  }, {
    cmd: [`cat <<'EOF' | lxc exec ${options.name} -- bash`, options.trap ? 'set -e' : void 0, options.cmd, 'EOF'].join('\n')
  }, callback);
};
