// Generated by CoffeeScript 2.4.1
// # `nikita.lxd.network`

// Create a network or update a network configuration

// ## Options

// * `network` (required, string)   
//   The network name.
// * `config` (optional, object, {})   
//   The network configuration, see
//   [available fields](https://lxd.readthedocs.io/en/latest/networks/).

// ## Callback parameters

// * `err`   
//   Error object if any
// * `status`   
//   True if the network was created/updated

// ## Example

// ```js
// require('nikita')
// .lxd.network({
//   network: 'lxbr0'
//   config: {
//     'ipv4.address': '172.89.0.0/24',
//     'ipv6.address': 'none'
//   }
// }, function(err, {status}){
//   console.log( err ? err.message : 'Network created: ' + status);
// })
// ```

// ## Source Code
var diff, yaml;

module.exports = function({options}) {
  var k, key, ref, v, value;
  this.log({
    message: "Entering lxd network",
    level: "DEBUG",
    module: "@nikitajs/lxd/lib/network"
  });
  if (!options.network) {
    //Check args
    throw Error("Invalid Option: network is required to create a network");
  }
  ref = options.config;
  for (k in ref) {
    v = ref[k];
    if (typeof v === 'string') {
      continue;
    }
    options.config[k] = typeof v === 'boolean' ? v ? 'true' : 'false' : void 0;
  }
  // Command if the network does not yet exist
  return this.system.execute({
    // return code 5 indicates a version of lxc where 'network' command is not implemented
    cmd: `lxc network > /dev/null || exit 5\nlxc network show ${options.network} && exit 42\n${[
      'lxc',
      'network',
      'create',
      options.network,
      ...((function() {
        var ref1,
      results;
        ref1 = options.config;
        results = [];
        for (key in ref1) {
          value = ref1[key];
          results.push(`${key}='${value.replace('\'',
      '\\\'')}'`);
        }
        return results;
      })())
    ].join(' ')}`,
    code_skipped: 42
  }, function(err, {stdout, code}) {
    var changes, config, results;
    if (code === 5) {
      throw Error("This version of lxc does not support the network command");
    }
    // Network created
    if (code !== 42) {
      return;
    }
    // Network already exists, find the changes
    ({config} = yaml.safeLoad(stdout));
    changes = diff(config, options.config);
    results = [];
    for (key in changes) {
      value = changes[key];
      // if config is empty status is false because no command were executed
      results.push(this.system.execute({
        cmd: ['lxc', 'network', 'set', options.network, key, `'${value.replace('\'', '\\\'')}'`].join(' ')
      }));
    }
    return results;
  });
};

// trap  if a command fails ?

// ## Dependencies
yaml = require('js-yaml');

diff = require('object-diff');
