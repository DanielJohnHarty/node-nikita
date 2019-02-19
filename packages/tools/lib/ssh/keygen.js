// Generated by CoffeeScript 2.3.2
// # SSH keygen

// Generates keys for use by SSH protocol version 2.

// ## Options

// * `bits` (string|number, options, 4096)   
//   Specifies the number of bits in the key to create.
// * `comment` (string, optional)   
//   Comment such as a name or email.
// * `key_format` (string, optional)   
//   Specify a key format. The supported key formats are: `RFC4716` (RFC 4716/SSH2 public or
//   private key), `PKCS8` (PEM PKCS8 public key) or `PEM` (PEM public key).
// * `passphrase` (string, optional, "")
//   Key passphrase, empty string for no passphrase.
// * `target` (string, required)   
//   Path of the generated private key.
// * `type` (string, optional, "rsa")   
//   Type of key to create.

// ## Force the generation of a key compatible with SSH2

// For exemple in OSX Mojave, the default export format is RFC4716.

// ```
// require('nikita')
// .tools.ssh.keygen({
//   bits: 2048,
//   comment: 'my@email.com'
//   target: './id_rsa',
//   key_format: 'PEM'
// })

// ## Source code
var path;

module.exports = function({options}) {
  var ref;
  if (options.bits == null) {
    options.bits = 4096;
  }
  if (options.type == null) {
    options.type = 'rsa';
  }
  if (options.passphrase == null) {
    options.passphrase = '';
  }
  if (options.key_format == null) {
    options.key_format = null;
  }
  if (options.key_format && ((ref = options.key_format) !== 'RFC4716' && ref !== 'PKCS8' && ref !== 'PEM')) {
    throw Error(`Invalid Option: key_format must be one of RFC4716, PKCS8 or PEM, got ${JSON.stringify(options.key_format)}`);
  }
  if (!options.target) {
    // Validation
    throw Error('Required Option: target is required');
  }
  this.system.mkdir({
    target: `${path.dirname(options.target)}`
  });
  return this.system.execute({
    unless_exists: `${options.target}`,
    cmd: [
      'ssh-keygen',
      "-q", // Silence
      `-t ${options.type}`,
      `-b ${options.bits}`,
      options.key_format ? `-m ${options.key_format}` : void 0,
      options.comment ? `-C '${options.comment.replace('\'',
      '\\\'')}'` : void 0,
      `-N '${options.passphrase.replace('\'',
      '\\\'')}'`,
      `-f ${options.target}`
    ].join(' ')
  });
};

// ## Dependencies
path = require('path');
