
# `nikita.fs.exists`

Retrieve file information. If path is a symbolic link, then the link itself is
stat-ed, not the file that it refers to.

```js
require(nikita)
.fs.exists({
  target: '/path/to/file'
}, function(err, {exists}){
  console.log(err ? err.message :
    exists ? 'File exists' : 'File is missing')
})
```

## Source Code

    module.exports = status: false, log: false, handler: ({metadata, options}, callback) ->
      @log message: "Entering fs.exists", level: 'DEBUG', module: 'nikita/lib/fs/exists'
      # Normalize options
      options.target = metadata.argument if metadata.argument?
      @fs.stat
        target: options.target
        dereference: true
        sudo: options.sudo
        bash: options.bash
        arch_chroot: options.arch_chroot
        relax: true
      , (err) ->
        if err?.code is 'ENOENT'
          exists = false
          err = null
        else unless err
          exists = true
        callback err, exists: exists
