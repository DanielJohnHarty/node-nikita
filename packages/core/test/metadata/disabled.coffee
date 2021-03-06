
nikita = require '../../src'
{tags} = require '../test'

return unless tags.api

describe 'metadata "disable"', ->

  it 'dont call handler', ->
    nikita
    .call
      disabled: true
    , (otions) ->
      throw Error 'Achtung'
    .promise()

  it 'emit lifecycle event when disabled', ->
    nikita
    .call
      disabled: true
    , (otions) ->
      throw Error 'Achtung'
    .on 'lifecycle', (log) ->
      Object.keys(log).sort().should.eql [
          'depth', 'file',
          'index', 'level',
          'line', 'message',
          'metadata', 'module',
          'options', 'parent',
          'time', 'type'
      ]
      log.depth.should.eql 1
      log.index.should.eql 0
      log.level.should.eql 'INFO'
      log.message.should.eql 'disabled_true'
      log.metadata.headers.should.eql []
      log.metadata.shy.should.be.false()
      (log.module is undefined).should.be.true()
      log.type.should.eql 'lifecycle'
    .promise()

  it 'emit lifecycle event when not disabled', ->
    nikita
    .call
      disabled: false
    , ->
      throw Error 'Achtung'
    .on 'lifecycle', (log) ->
      return if log.message is 'conditions_passed'
      log.file.should.eql 'session.coffee.md'
      log.index.should.eql 0
      log.level.should.eql 'DEBUG'
      log.metadata.headers.should.eql []
      log.message.should.eql 'disabled_false'
      (log.module is undefined).should.be.true()
      log.type.should.eql 'lifecycle'
    .next (->)
    .promise()
