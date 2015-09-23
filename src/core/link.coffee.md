
# `link(options, callback)`

Create a symbolic link and it's parent directories if they don't yet
exist.

Note, it is valid for the "source" file to not exist.

## Options

*   `source`   
    Referenced file to be linked.   
*   `destination`   
    Symbolic link to be created.   
*   `exec`   
    Create an executable file with an `exec` command.   
*   `mode`   
    Default to `0o0755`.   
*   `ssh` (object|ssh2)   
    Run the action on a remote server using SSH, an ssh2 instance or an
    configuration object used to initialize the SSH connection.   
*   `stdout` (stream.Writable)   
    Writable EventEmitter in which the standard output of executed commands will
    be piped.   
*   `stderr` (stream.Writable)   
    Writable EventEmitter in which the standard error output of executed command
    will be piped.   

## Callback parameters

*   `err`   
    Error object if any.   
*   `linked`   
    Number of created links.   

## Example

```js
require('mecano').link({
  source: __dirname,
  destination: '/tmp/a_link'
}, function(err, linked){
  console.log(err ? err.message : 'Link created: ' + !!linked);
});
```

## Source Code

    module.exports = (options, callback) ->
      linked = 0
      sym_exists = (options, callback) ->
        fs.exists options.ssh, options.destination, (err, exists) ->
          return callback null, false unless exists
          fs.readlink options.ssh, options.destination, (err, resolvedPath) ->
            return callback err if err
            return callback null, true if resolvedPath is options.source
            fs.unlink options.ssh, options.destination, (err) ->
              return callback err if err
              callback null, false
      sym_create = (options, callback) ->
        fs.symlink options.ssh, options.source, options.destination, (err) ->
          return callback err if err
          linked++
          callback()
      exec_exists = (options, callback) ->
        fs.exists options.ssh, options.destination, (err, exists) ->
          return callback null, false unless exists
          fs.readFile options.ssh, options.destination, 'utf8', (err, content) ->
            return callback err if err
            exec_cmd = /exec (.*) \$@/.exec(content)[1]
            callback null, exec_cmd and exec_cmd is options.source
      exec_create = (options, callback) ->
        content = """
        #!/bin/bash
        exec #{options.source} $@
        """
        fs.writeFile options.ssh, options.destination, content, (err) ->
          return callback err if err
          fs.chmod options.ssh, options.destination, options.mode, (err) ->
            return callback err if err
            linked++
            callback()
      return callback new Error "Missing source, got #{JSON.stringify(options.source)}" unless options.source
      return callback new Error "Missing destination, got #{JSON.stringify(options.destination)}" unless options.destination
      options.mode ?= 0o0755
      do_mkdir = =>
        @mkdir
          ssh: options.ssh
          destination: path.dirname options.destination
        , (err, created) ->
          # It is possible to have collision if to symlink
          # have the same parent directory
          return callback err if err and err.code isnt 'EEXIST'
          do_dispatch()
      do_dispatch = ->
        if options.exec
          exec_exists options, (err, exists) ->
            return do_end() if exists
            exec_create options, do_end
        else
          sym_exists options, (err, exists) ->
            return do_end() if exists
            sym_create options, do_end
      do_end = ->
        callback null, linked
      do_mkdir()

## Dependencies

    fs = require 'ssh2-fs'
    path = require 'path'



