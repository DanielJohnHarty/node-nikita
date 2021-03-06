
nikita = require '@nikitajs/core'
{tags, ssh} = require './test'
they = require('ssh2-they').configure ssh...

return unless tags.lxd

describe 'lxd.start', ->

  they 'Start a container', ({ssh}) ->
    nikita
      ssh: ssh
    .lxd.delete
      container: 'u1'
      force: true
    .lxd.init
      image: 'ubuntu:18.04'
      container: 'u1'
    .lxd.start
      container: 'u1'
    , (err, {status}) ->
      status.should.be.true()
    .promise()

  they 'Already started', ({ssh}) ->
    nikita
      ssh: ssh
    .lxd.delete
      container: 'u1'
      force: true
    .lxd.init
      image: 'ubuntu:18.04'
      container: 'u1'
    .lxd.start
      container: 'u1'
    .lxd.start
      container: 'u1'
    , (err, {status}) ->
      status.should.be.false()
    .promise()
