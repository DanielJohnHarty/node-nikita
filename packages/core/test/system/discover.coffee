
nikita = require '../../src'
{tags, ssh} = require '../test'
they = require('ssh2-they').configure ssh...

return unless tags.system_discover

describe 'system.discover', ->
  
  @timeout 30000

  they 'return info on RH', ({ssh}) ->
    nikita
      ssh: ssh
    .call
      if_exec: "cat /etc/system-release | egrep '(Red\sHat)|(CentOS)'"
    , ->
      @system.discover (err, {type, release}) ->
        type.should.match /^((redhat)|(centos))/ unless err
        release.should.match /^[6|7]./ unless err
    .promise()

  they 'return info on Ubuntu', ({ssh}) ->
    nikita
      ssh: ssh
    .call
      if_exec: "cat /etc/lsb-release | egrep '(Ubuntu)'"
    , ->
      @system.discover (err, {type, release}) ->
        type.should.match /^(ubuntu)/
        release.should.match /^\d+./
    .promise()

  they 'dont cache by default on RH', ({ssh}) ->
    nikita
      ssh: ssh
    .call
      if_exec: "cat /etc/system-release | egrep '(Red\sHat)|(CentOS)'"
    , ->
      @system.discover (err, {status}) -> status.should.be.true() unless err
      @system.discover (err, {status}) -> status.should.be.true() unless err
    .promise()

  they 'dont cache by default on Ubuntu', ({ssh}) ->
    nikita
      ssh: ssh
    .call
      if_exec: "cat /etc/lsb-release | egrep '(Ubuntu)'"
    , ->
      @system.discover (err, {status}) -> status.should.be.true() unless err
      @system.discover (err, {status}) -> status.should.be.true() unless err
    .promise()

  they 'honors cache on RH', ({ssh}) ->
    nikita
      ssh: ssh
    .call
      if_exec: "cat /etc/system-release | egrep '(Red\sHat)|(CentOS)'"
    , ->
      @system.discover cache: true, (err, {status}) -> status.should.be.true() unless err
      @system.discover cache: true, (err, {status}) -> status.should.be.false() unless err
      @call ->
        @store['nikita:system:type'].should.match /^((redhat)|(centos))/
        @store['nikita:system:release'].should.match /^[6|7]./
    .promise()

  they 'honors cache on Ubuntu', ({ssh}) ->
    nikita
      ssh: ssh
    .call
      if_exec: "cat /etc/lsb-release | egrep '(Ubuntu)'"
    , ->
      @system.discover cache: true, (err, {status}) -> status.should.be.true() unless err
      @system.discover cache: true, (err, {status}) -> status.should.be.false() unless err
      @call ->
        @store['nikita:system:type'].should.match /^(ubuntu)/
        @store['nikita:system:release'].should.match /^\d+./
    .promise()
