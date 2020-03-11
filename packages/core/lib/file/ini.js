// Generated by CoffeeScript 2.5.1
// # `nikita.file.ini`

// Write an object as .ini file. Note, we are internally using the [ini] module.
// However, there is a subtle difference. Any key provided with value of 
// `undefined` or `null` will be disregarded. Within a `merge`, it get more
// prowerfull and tricky: the original value will be kept if `undefined` is
// provided while the value will be removed if `null` is provided.

// The `file.ini` function rely on the `file` function and accept all of its
// options. It introduces the `merge` option which instruct to read the
// target file if it exists and merge its parsed object with the one
// provided in the `content` option.

// ## Options   

// * `backup` (string|boolean)   
//   Create a backup, append a provided string to the filename extension or a
//   timestamp if value is not a string, only apply if the target file exists and
//   is modified.
// * `clean` (boolean)   
//   Remove all the lines whithout a key and a value, default to "true".
// * `content` (object)   
//   Object to stringify.
// * `escape` (boolean)   
//   Escape the section's header title replace '.' by '\.'; "true" by default.
// * `merge` (boolean)   
//   Read the target if it exists and merge its content.
// * `parse` (function)   
//   User-defined function to parse the content from ini format, default to
//   `require('ini').parse`, see 'misc.ini.parse\_multi\_brackets'.
// * `stringify` (function)   
//   User-defined function to stringify the content to ini format, default to
//   `require('ini').stringify`, see 'misc.ini.stringify\_brackets\_then_curly' for
//   an example.
// * `eol` (string)   
//   Characters for line delimiter, usage depends on the stringify option, with 
//   the default stringify option, default to unix style if executed remotely 
//   (SSH) or to the platform if executed locally ("\r\n for windows", 
//   "\n" otherwise)
// * `source` (string)   
//   Path to a ini file providing default options; lower precedence than the
//   content object; may be used conjointly with the local option; optional, use
//   should_exists to enforce its presence.
// * `target` (string)   
//   File path where to write content to or a callback.

// Available values for the `stringify` option are:

// * `stringify`
//   Default, implemented by `require('nikita/lib/misc/ini').stringify`
// * `stringify`
//   Default, implemented by `require('nikita/lib/misc/ini').stringify`

// The default stringify function accepts:

// * `separator` (string)   
//   Characteres used to separate keys from values; default to " : ".

// ## Callback parameters

// * `err`   
//   Error object if any.   
// * `status`   
//   Indicate a change in the target file.   

// ## Example

// ```js
// require('nikita')
// .file.ini({
//   content: {
//     'my_key': 'my value'
//   },
//   target: '/tmp/my_file'
// }, function(err, {status}){
//   console.log(err ? err.message : 'Content was updated: ' + status);
// });
// ```

// ## Schema
var handler, ini, merge, schema;

schema = {
  // name: '@nikitajs/core/lib/file/ini'
  // $ref: '@nikitajs/core/lib/file'
  type: 'object',
  properties: {
    'clean': {
      type: 'boolean'
    },
    'content': {
      type: 'object'
    },
    'escape': {
      type: 'boolean'
    },
    'merge': {
      type: 'boolean'
    },
    'parse': {
      typeof: 'function'
    },
    'stringify': {
      typeof: 'function'
    },
    'eol': {
      type: 'string'
    }
  }
};

// ## Handler
handler = function({options}) {
  var default_props, org_props, parse;
  this.log({
    message: "Entering file.ini",
    level: 'DEBUG',
    module: 'nikita/lib/file/ini'
  });
  // Normalization
  if (options.clean == null) {
    options.clean = true;
  }
  if (options.escape == null) {
    options.escape = true;
  }
  if (options.content == null) {
    options.content = {};
  }
  if (options.encoding == null) {
    options.encoding = 'utf8';
  }
  if (!(options.content || !options.source)) {
    // Validation
    throw Error("Required Option: one of 'content' or 'source' is mandatory");
  }
  if (!options.target) {
    throw Error("Required Option: option 'target' is mandatory");
  }
  org_props = {};
  default_props = {};
  parse = options.parse || ini.parse;
  // Original properties
  this.fs.readFile({
    target: options.target,
    encoding: options.encoding,
    relax: true
  }, function(err, {data}) {
    if ((err != null ? err.code : void 0) === 'ENOENT') {
      return;
    }
    if (err) {
      throw err;
    }
    return org_props = parse(data, options);
  });
  // Default properties
  this.fs.readFile({
    if: options.source,
    ssh: options.local ? false : options.ssh,
    sudo: options.local ? false : options.sudo,
    target: options.source,
    encoding: options.encoding,
    relax: true
  }, function(err, {data}) {
    var content;
    if ((err != null ? err.code : void 0) === 'ENOENT') {
      return;
    }
    if (err) {
      throw err;
    }
    if (!options.source) {
      return;
    }
    content = ini.clean(options.content, true);
    return options.content = merge(parse(data, options), options.content);
  });
  // Merge
  this.call({
    if: options.merge
  }, function({}, callback) {
    options.content = merge(org_props, options.content);
    this.log({
      message: "Get content for merge",
      level: 'DEBUG',
      module: 'nikita/lib/file/ini'
    });
    return callback();
  });
  return this.call(function() {
    var stringify;
    if (options.clean) {
      this.log({
        message: "Clean content",
        level: 'INFO',
        module: 'nikita/lib/file/ini'
      });
      ini.clean(options.content);
    }
    this.log({
      message: "Serialize content",
      level: 'DEBUG',
      module: 'nikita/lib/file/ini'
    });
    stringify = options.stringify || ini.stringify;
    return this.file({
      target: options.target,
      content: stringify(options.content, options),
      backup: options.backup,
      diff: options.diff,
      eof: options.eof,
      gid: options.gid,
      uid: options.uid,
      mode: options.mode
    });
  });
};

// ## Exports
module.exports = {
  schema: schema,
  handler: handler
};

// ## Dependencies
ini = require('../misc/ini');

({merge} = require('mixme'));

// [ini]: https://github.com/isaacs/ini
