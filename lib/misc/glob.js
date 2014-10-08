// Generated by CoffeeScript 1.8.0
var Minimatch, exec, getprefix, glob, path;

path = require('path');

glob = require('glob');

Minimatch = require('minimatch').Minimatch;

exec = require('ssh2-exec');

getprefix = function(pattern) {
  var n, prefix;
  prefix = null;
  n = 0;
  while (typeof pattern[n] === "string") {
    n++;
  }
  switch (n) {
    case pattern.length:
      prefix = pattern.join('/');
      return prefix;
    case 0:
      return null;
    default:
      prefix = pattern.slice(0, n);
      prefix = prefix.join('/');
      return prefix;
  }
};


/*
Important: for now, only the "dot" options has been tested.
 */

module.exports = function(ssh, pattern, options, callback) {
  var cmd, minimatch, prefix, s, _i, _len, _ref;
  if (arguments.length === 3) {
    callback = options;
    options = {};
  }
  if (ssh) {
    pattern = path.normalize(pattern);
    minimatch = new Minimatch(pattern, options);
    cmd = "find";
    _ref = minimatch.set;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      s = _ref[_i];
      prefix = getprefix(s);
      cmd += " -f " + prefix;
    }
    return exec(ssh, cmd, function(err, stdout) {
      var files, n, _j, _len1, _ref1;
      if (err) {
        return callback(null, []);
      }
      files = stdout.trim().split(/\r\n|[\n\r\u0085\u2028\u2029]/g);
      files = files.filter(function(file) {
        return minimatch.match(file);
      });
      _ref1 = minimatch.set;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        s = _ref1[_j];
        n = 0;
        while (typeof s[n] === "string") {
          n++;
        }
        if (s[n] === Minimatch.GLOBSTAR) {
          prefix = getprefix(s);
          if (prefix) {
            files.unshift(prefix);
          }
        }
      }
      return callback(err, files);
    });
  } else {
    return glob("" + pattern, options, function(err, files) {
      return callback(err, files);
    });
  }
};