// Generated by CoffeeScript 2.5.1
// # `nikita.fs.chmod`

// Change permissions of a file.

// ## Source Code
module.exports = {
  status: false,
  log: false,
  handler: function({metadata, options}, callback) {
    this.log({
      message: "Entering fs.chmod",
      level: 'DEBUG',
      module: 'nikita/lib/fs/chmod'
    });
    if (metadata.argument != null) {
      // Normalize options
      options.target = metadata.argument;
    }
    if (!options.target) {
      // Validate options
      throw Error(`Missing target: ${JSON.stringify(options.target)}`);
    }
    if (!options.mode) {
      throw Error("Missing option 'mode'");
    }
    if (typeof options.mode === 'number') {
      options.mode = options.mode.toString(8).substr(-4);
    }
    return this.system.execute({
      if: options.mode,
      cmd: `chmod ${options.mode} ${options.target}`,
      sudo: options.sudo,
      bash: options.bash,
      arch_chroot: options.arch_chroot
    }, function(err) {
      return callback(err);
    });
  }
};
