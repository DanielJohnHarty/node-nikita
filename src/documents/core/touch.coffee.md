
# `touch(options, callback)`

Create a empty file if it does not yet exists.

## Implementation details

Internally, it delegates most of the work to the `mecano.write` module. It isn't
yet a real `touch` implementation since it doesnt change the file time if it
exists.

## Options

*   `target`   
    File path where to write content to.   
*   `ssh` (object|ssh2)   
    Run the action on a remote server using SSH, an ssh2 instance or an
    configuration object used to initialize the SSH connection.   
*   `stdout` (stream.Writable)   
    Writable EventEmitter in which the standard output of executed commands will
    be piped.   
*   `stderr` (stream.Writable)   
    Writable EventEmitter in which the standard error output of executed command
    will be piped.   

## Example

```js
require('mecano').touch({
  ssh: ssh,
  target: '/tmp/a_file'
}, function(err, touched){
  console.log(err ? err.message : 'File touched: ' + !!touched);
});
```

## Source Code

    module.exports = (options, callback) ->
      wrap @, arguments, (options, callback) ->
        # Validate parameters
        {ssh, target, mode} = options
        return callback new Error "Missing target: #{target}" unless target
        options.log? "Check if exists: #{target}"
        fs.exists ssh, target, (err, exists) ->
          return callback err if err
          return callback() if exists
          options.source = null
          options.content = ''
          options.log? "Create a new empty file"
          write options, (err, written) ->
            callback err, written

## Dependencies

    fs = require 'ssh2-fs'
    wrap = require './misc/wrap'
    write = require './write'






