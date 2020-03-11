// Generated by CoffeeScript 2.5.1
// # `nikita.lxd.config.device.exists`

// Add devices to containers or profiles.

// ## Options

// * `container` (string, required)
//   The name of the container.
// * `device` (string, required)
//   Name of the device in LXD configuration, for example "eth0".

// ## Callback parameters

// * `err`
//   Error object if any.
// * `result.status`
//   True if the device exist, false otherwise.

// ## Add a network interface

// ```js
// require('nikita')
// .lxd.config.device.exists({
//   container: "my_container",
//   device: 'eth0',
// }, function(err, {status, config}) {
//   console.log( err ? err.message : status ?
//     'device exists, type is' + config.type : 'device missing')
// });
// ```

// ## Source Code
var diff, validate_container_name, yaml;

module.exports = {
  shy: true,
  handler: function({options}, callback) {
    this.log({
      message: "Entering lxd.config.device.exists",
      level: 'DEBUG',
      module: '@nikitajs/lxd/lib/config/device/exists'
    });
    if (!options.container) {
      // Validation
      throw Error("Invalid Option: container is required");
    }
    validate_container_name(options.container);
    if (!options.device) {
      throw Error("Invalid Option: device is required");
    }
    return this.lxd.config.device.show({
      container: options.container,
      device: options.device
    }, function(err, {config}) {
      if (err) {
        return callback(err);
      }
      return callback(null, {
        status: !!config,
        config: config
      });
    });
  }
};

// ## Dependencies
yaml = require('js-yaml');

diff = require('object-diff');

validate_container_name = require('../../misc/validate_container_name');
