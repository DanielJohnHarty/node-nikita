// Generated by CoffeeScript 1.10.0
var fs, merge;

module.exports = function(options) {
  if (options.content == null) {
    options.content = {};
  }
  if (options.pretty == null) {
    options.pretty = false;
  }
  if (options.pretty === true) {
    options.pretty = 2;
  }
  if (options.transform == null) {
    options.transform = null;
  }
  if (options.transform && typeof options.transform !== 'function') {
    throw Error("Invalid options: \"transform\"");
  }
  this.call({
    "if": options.merge
  }, function(_, callback) {
    return fs.readFile(options.ssh, options.target, 'utf8', function(err, json) {
      if (!err) {
        options.content = merge(JSON.parse(json), options.content);
      }
      return callback(err);
    });
  });
  this.call({
    "if": options.source
  }, function(_, callback) {
    var ssh;
    ssh = options.local ? null : options.ssh;
    return fs.readFile(ssh, options.source, 'utf8', function(err, json) {
      if (!err) {
        options.content = merge(JSON.parse(json), options.content);
      }
      return callback(err);
    });
  });
  this.call({
    "if": options.transform
  }, function() {
    return options.content = options.transform(options.content);
  });
  return this.file({
    target: options.target,
    content: function() {
      return JSON.stringify(options.content, null, options.pretty);
    },
    backup: options.backup,
    diff: options.diff,
    eof: options.eof,
    gid: options.gid,
    uid: options.uid,
    mode: options.mode
  });
};

fs = require('ssh2-fs');

merge = require('../misc').merge;