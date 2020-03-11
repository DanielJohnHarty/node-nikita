// Generated by CoffeeScript 2.5.1
// # `nikita.file.upload`

// Upload a file to a remote location. Options are identical to the "write"
// function with the addition of the "binary" option.

// ## Options

// * `binary`   
//   Fast upload implementation, discard all the other option and use its own
//   stream based implementation.
// * `from`   
//   Replace from after this marker, a string or a regular expression.
// * `to`   
//   Replace to before this marker, a string or a regular expression.
// * `match`   
//   Replace this marker, a string or a regular expression.
// * `replace`   
//   The content to be inserted, used conjointly with the from, to or match
//   options.
// * `content`   
//   Text to be written.
// * `source`   
//   File path from where to extract the content, do not use conjointly with
//   content.
// * `target`   
//   File path where to write content to.
// * `backup` (string|boolean)   
//   Create a backup, append a provided string to the filename extension or a
//   timestamp if value is not a string, only apply if the target file exists and
//   is modified.
// * `md5`   
//   Validate uploaded file with md5 checksum (only for binary upload for now),
//   may be the string checksum or will be deduced from source if "true".
// * `sha1`   
//   Validate uploaded file with sha1 checksum (only for binary upload for now),
//   may be the string checksum or will be deduced from source if "true".
// * `ssh` (object|ssh2)   
//   Run the action on a remote server using SSH, an ssh2 instance or an
//   configuration object used to initialize the SSH connection.
// * `stdout` (stream.Writable)   
//   Writable EventEmitter in which the standard output of executed commands will
//   be piped.
// * `stderr` (stream.Writable)   
//   Writable EventEmitter in which the standard error output of executed command
//   will be piped.

// ## Callback parameters

// * `err`   
//   Error object if any.   
// * `status`   
//   Value is "true" if file was uploaded.   

// ## Example

// ```js
// require('nikita')
// .file.upload({
//   ssh: ssh
//   source: '/tmp/local_file',
//   target: '/tmp/remote_file'
// }, function(err, {status}){
//   console.info(err ? err.message : 'File uploaded: ' + status);
// });
// ```

// ## Source Code
var fs, misc, path;

module.exports = function({options}) {
  var algo, ref, ref1, ssh, stage_target, status, target_stats;
  this.log({
    message: "Entering file.upload",
    level: 'DEBUG',
    module: 'nikita/lib/file/upload'
  });
  // SSH connection
  ssh = this.ssh(options.ssh);
  if (!options.source) {
    // Options
    throw Error("Required \"source\" option");
  }
  if (!options.target) {
    throw Error("Required \"target\" option");
  }
  this.log({
    message: `Source is \"${options.source}\"`,
    level: 'DEBUG',
    module: 'nikita/lib/file/upload'
  });
  this.log({
    message: `Destination is \"${options.target}\"`,
    level: 'DEBUG',
    module: 'nikita/lib/file/upload'
  });
  status = false;
  // source_stats = null
  target_stats = null;
  stage_target = null;
  if (options.md5 != null) {
    if ((ref = typeof options.md5) !== 'string' && ref !== 'boolean') {
      return callback(Error(`Invalid MD5 Hash:${options.md5}`));
    }
    algo = 'md5';
  } else if (options.sha1 != null) {
    if ((ref1 = typeof options.sha1) !== 'string' && ref1 !== 'boolean') {
      return callback(Error(`Invalid SHA-1 Hash:${options.sha1}`));
    }
    algo = 'sha1';
  } else {
    algo = 'md5';
  }
  // Stat the target and redefine its path if a directory
  this.call(function(_, callback) {
    return this.fs.stat({
      ssh: false,
      sudo: false,
      target: options.target
    }, function(err, {stats}) {
      if (err && err.code !== 'ENOENT') {
        // Unexpected err
        return callback(err);
      }
      if (err) {
        // Target does not exists
        return callback();
      }
      // Target is a file
      if (misc.stats.isFile(stats.mode)) {
        target_stats = stats;
        return callback();
      // Target is invalid
      } else if (!misc.stats.isDirectory(stats.mode)) {
        throw Error(`Invalid Target: expect a file, a symlink or a directory for ${JSON.stringify(options.target)}`);
      }
      // Target is a directory
      options.target = path.resolve(options.target, path.basename(options.source));
      return this.fs.stat({
        ssh: false,
        sudo: false,
        target: options.target
      }, function(err, {stats}) {
        if (err && err.code === 'ENOENT') {
          return callback();
        }
        if (err) {
          return callback(err);
        }
        if (misc.stats.isFile(stats.mode)) {
          target_stats = stats;
        }
        if (misc.stats.isFile(stats.mode)) {
          return callback();
        }
        return callback(Error(`Invalid target: ${options.target}`));
      });
    });
  });
  this.call(function() {
    // Now that we know the real name of the target, define a temporary file to write
    return stage_target = `${options.target}.${Date.now()}${Math.round(Math.random() * 1000)}`;
  });
  this.call(function({}, callback) {
    var hash_source, hash_target;
    if (!target_stats) {
      return callback(null, true);
    }
    hash_source = hash_target = null;
    this.file.hash({
      target: options.source,
      algo: algo
    }, function(err, {hash}) {
      if (err) {
        return callback(err);
      }
      return hash_source = hash;
    });
    this.file.hash({
      target: options.target,
      algo: algo,
      ssh: false,
      sudo: false
    }, function(err, {hash}) {
      if (err) {
        return callback(err);
      }
      return hash_target = hash;
    });
    return this.call(function() {
      var match;
      match = hash_source === hash_target;
      this.log(match ? {
        message: `Hash matches as '${hash_source}'`,
        level: 'INFO',
        module: 'nikita/lib/file/download'
      } : {
        message: `Hash dont match, source is '${hash_source}' and target is '${hash_target}'`,
        level: 'WARN',
        module: 'nikita/lib/file/download'
      });
      return callback(null, !match);
    });
  });
  this.call({
    if: function() {
      return this.status(-1);
    }
  }, function() {
    this.system.mkdir({
      ssh: false,
      sudo: false,
      target: path.dirname(stage_target)
    });
    this.fs.createReadStream({
      target: options.source,
      stream: function(rs) {
        var ws;
        ws = fs.createWriteStream(stage_target);
        return rs.pipe(ws);
      }
    });
    return this.system.move({
      ssh: false,
      sudo: false,
      source: stage_target,
      target: options.target
    }, function(err, {status}) {
      if (status) {
        return this.log({
          message: "Unstaged uploaded file",
          level: 'INFO',
          module: 'nikita/lib/file/upload'
        });
      }
    });
  });
  this.system.chmod({
    ssh: false,
    sudo: false,
    target: options.target,
    mode: options.mode,
    if: options.mode != null
  });
  return this.system.chown({
    ssh: false,
    sudo: false,
    target: options.target,
    uid: options.uid,
    gid: options.gid,
    if: (options.uid != null) || (options.gid != null)
  });
};

// ## Dependencies
fs = require('fs');

path = require('path');

misc = require('../misc');
