// Generated by CoffeeScript 2.5.0
  // # `nikita.lxd.config.device`

// Create a device or update its configuration.

// ## Options

// * `container` (string, required)
  //   The name of the container.
  // * `device` (string, required)
  //   Name of the device in LXD configuration, for example "eth0".
  // * `config` (object, required)
  //   One or multiple keys to set.
  // * `type` (string, required)
  //   Type of device, see [list of devices type](https://github.com/lxc/lxd/blob/master/doc/containers.md#device-types).

// ## Callback parameters

// * `err`
  //   Error object if any.
  // * `result.status`
  //   True if the device was created or the configuraion updated.

// ## Example

// ```js
  // require('nikita')
  // .lxd.config.device({
  //   container: 'container1',
  //   device: 'root',
  //   type: 'disk'
  //   config: {
  //     'pool': 'system',
  //     'size': '10GB'
  //   }
  // }, function(err, {status}){
  //   console.log( err ? err.message : 'Network created: ' + status);
  // })
  // ```

// ## Source Code
var diff, stderr_to_error_message, validate_container_name,
  indexOf = [].indexOf;

module.exports = {
  handler: function({options}, callback) {
    var valid_devices;
    this.log({
      message: "Entering lxd config.device",
      level: "DEBUG",
      module: "@nikitajs/lxd/lib/config/device"
    });
    //Check args
    valid_devices = ['none', 'nic', 'disk', 'unix-char', 'unix-block', 'usb', 'gpu', 'infiniband', 'proxy'];
    if (!options.container) {
      // Validation
      throw Error("Invalid Option: container is required");
    }
    validate_container_name(options.container);
    if (!options.device) {
      throw Error("Invalid Option: Device name (options.device) is required");
    }
    return this.lxd.config.device.show({
      container: options.container,
      device: options.device
    }, function(err, {status, config}) {
      var changes, k, key, ref, ref1, v, value;
      if (err) {
        return callback(err);
      }
      if (!config) {
        if (ref = options.type, indexOf.call(valid_devices, ref) < 0) {
          return callback(Error(`Invalid Option: Unrecognized device type: ${options.type}, valid devices are: ${valid_devices.join(', ')}`));
        }
        ref1 = options.config;
        for (k in ref1) {
          v = ref1[k];
          if (typeof v === 'string') {
            continue;
          }
          options.config[k] = typeof v === 'boolean' ? v ? 'true' : 'false' : void 0;
        }
        return this.system.execute({
          cmd: [
            'lxc',
            'config',
            'device',
            'add',
            options.container,
            options.device,
            options.type,
            ...((function() {
              var ref2,
            results;
              ref2 = options.config;
              results = [];
              for (key in ref2) {
                value = ref2[key];
                results.push(`${key}='${value.replace('\'',
            '\\\'')}'`);
              }
              return results;
            })())
          ].join(' ')
        }, function(err, {stderr}) {
          if (err) {
            stderr_to_error_message(err, stderr);
          }
          return callback(err, {
            status: true
          });
        });
      } else {
        changes = diff(config, options.config);
        if (!Object.keys(changes).length) {
          return callback(null, {
            status: false
          });
        }
        this.system.execute({
          cmd: ((function() {
            var results;
            results = [];
            for (key in changes) {
              value = changes[key];
              results.push(['lxc', 'config', 'device', 'set', options.container, options.device, key, `'${value.replace('\'', '\\\'')}'`].join(' '));
            }
            return results;
          })()).join('\n')
        }, function(err, {stderr}) {
          if (err) {
            return stderr_to_error_message(err, stderr);
          }
        });
        return this.next(function(err) {
          return callback(err, {
            status: true
          });
        });
      }
    });
  }
};

// ## Dependencies
diff = require('object-diff');

validate_container_name = require('../../misc/validate_container_name');

stderr_to_error_message = require('../../misc/stderr_to_error_message');
