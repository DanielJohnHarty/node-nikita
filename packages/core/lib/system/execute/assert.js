// Generated by CoffeeScript 2.5.1
// # `nikita.system.execute.assert`

// Assert a shell command.

// ## Options

// * `code` (number, optional, 0)   
//   Expected exit code, activated by default unless content is provided.
// * `content` (string|buffer, optional)   
//   Content to match, optional.
// * `cmd` (string, required)   
//   String, Object or array; Command to execute.
// * `error` (string, optional)   
//   The error message to throw if assert failed.
// * `not` (boolean, optional)   
//   Negates the validation.   
// * `trim` (boolean, optional)   
//   Trim the actuel and expected content before matching, default is "false".

// All options are passed to `system.execute`.

// ## Assert a command succeed

// ```javascript
// nikita.system.execute.assert({
//   cmd: 'exit 0'
// }, function(err){
//   console.info(err || 'ok');
// });
// ```

// ## Assert a command stdout

// ```javascript
// nikita.system.execute.assert({
//   cmd: 'echo hello'
//   assert: 'hello'
// }, function(err){
//   console.info(err || 'ok');
// });
// ```

// ## Source Code
module.exports = function({options}) {
  if (!options.cmd) {
    throw Error('Required Option: option `cmd` is not defined');
  }
  if (!options.content) {
    if (options.code == null) {
      options.code = 0;
    }
  }
  if (options.trim == null) {
    options.trim = false;
  }
  if (Buffer.isBuffer(options.content)) {
    options.content = options.content.toString();
  }
  if (options.content && options.trim) {
    options.content = options.content.trim();
  }
  // Command exit code
  this.call({
    if: options.code != null
  }, function() {
    return this.system.execute(options, {
      relax: true
    }, function(err, {code}) {
      if (!options.not) {
        if (code !== options.code) {
          if (options.error == null) {
            options.error = `Invalid command: exit code is ${code}, expect ${options.code}`;
          }
          throw Error(options.error);
        }
      } else {
        if (code === options.code) {
          if (options.error == null) {
            options.error = `Invalid command: exit code is ${code}, expect anything but ${options.code}`;
          }
          throw Error(options.error);
        }
      }
    });
  });
  // Content is a string or a buffer
  this.call({
    if: (options.content != null) && (typeof options.content === 'string' || Buffer.isBuffer(options.content))
  }, function() {
    return this.system.execute(options, options.cmd, function(err, {stdout}) {
      if (err) {
        throw err;
      }
      if (options.trim) {
        stdout = stdout.trim();
      }
      if (!options.not) {
        if (stdout !== options.content) {
          if (options.error == null) {
            options.error = `Invalid content: expect ${JSON.stringify(options.content.toString())} and got ${JSON.stringify(stdout.toString())}`;
          }
          err = Error(options.error);
        }
      } else {
        if (stdout === options.content) {
          if (options.error == null) {
            options.error = `Unexpected content: ${JSON.stringify(options.content.toString())}`;
          }
          err = Error(options.error);
        }
      }
      if (err) {
        throw err;
      }
    });
  });
  // Content is a regexp
  return this.call({
    if: (options.content != null) && options.content instanceof RegExp
  }, function() {
    return this.system.execute(options, options.cmd, function(err, {stdout}) {
      if (err) {
        throw err;
      }
      if (options.trim) {
        stdout = stdout.trim();
      }
      if (!options.not) {
        if (!options.content.test(stdout)) {
          if (options.error == null) {
            options.error = "Invalid content match";
          }
          err = Error(options.error);
        }
      } else {
        if (options.content.test(stdout)) {
          if (options.error == null) {
            options.error = "Unexpected content match";
          }
          err = Error(options.error);
        }
      }
      if (err) {
        throw err;
      }
    });
  });
};
