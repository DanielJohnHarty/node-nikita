
# `move(options, callback)`

Move files and directories. It is ok to overwrite the destination file if it
exists, in which case the source file will no longer exists.

## Options

*   `destination`   
    Final name of the moved resource.   
*   `force`   
    Force the replacement of the file without checksum verification, speed up
    the action and disable the `moved` indicator in the callback.   
*   `source`   
    File or directory to move.   
*   `destination_md5`   
    Destination md5 checkum if known, otherwise computed if destination
    exists.   
*   `source_md5`   
    Source md5 checkum if known, otherwise computed.   
*   `ssh` (object|ssh2)   
    Run the action on a remote server using SSH, an ssh2 instance or an
    configuration object used to initialize the SSH connection.   

## Callback parameters

*   `err`   
    Error object if any.   
*   `moved`   
    Number of moved resources.   

## Example

```js
require('mecano').move({
  source: __dirname,
  desination: '/tmp/my_dir'
}, function(err, moved){
  console.log(err ? err.message : 'File moved: ' + !!moved);
});
```

## Source Code

    module.exports = (options, callback) ->
      do_exists = ->
        options.log? "Mecano `move`: Stat destination"
        fs.stat options.ssh, options.destination, (err, stat) ->
          return do_move() if err?.code is 'ENOENT'
          return callback err if err
          if options.force
          then do_replace_dest()
          else do_srchash()
      do_srchash = ->
        return do_dsthash() if options.source_md5
        options.log? "Mecano `move`: Get source md5"
        misc.file.hash options.ssh, options.source, 'md5', (err, hash) ->
          return callback err if err
          options.source_md5 = hash
          do_dsthash()
      do_dsthash = ->
        return do_chkhash() if options.destination_md5
        options.log? "Mecano `move`: Get destination md5"
        misc.file.hash options.ssh, options.destination, 'md5', (err, hash) ->
          return callback err if err
          options.destination_md5 = hash
          do_chkhash()
      do_chkhash = ->
        if options.source_md5 is options.destination_md5
        then do_remove_src()
        else do_replace_dest()
      do_replace_dest = =>
        options.log? "Mecano `move`: Remove #{options.destination}"
        @remove
          destination: options.destination
        , (err, removed) ->
          return callback err if err
          do_move()
      do_move = ->
        options.log? "Mecano `move`: Rename #{options.source} to #{options.destination}"
        fs.rename options.ssh, options.source, options.destination, (err) ->
          return callback err if err
          callback null, true
      do_remove_src = =>
        options.log? "Mecano `move`: Remove #{options.source}"
        @remove
          destination: options.source
        , (err, removed) ->
          callback err
      do_exists()

## Dependencies

    fs = require 'ssh2-fs'
    misc = require '../misc'