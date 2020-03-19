
nikita = require '../../src'
registry = require '../../src/registry'

describe 'registry.get', ->

  it 'return null when not registered', ->
    reg = registry.create()
    action = reg.get ['get', 'an', 'action']
    (action is null).should.be.True()

  it 'a registered function', ->
    reg = registry.create()
    reg.register ['get', 'an', 'action'], (->)
    action = reg.get ['get', 'an', 'action']
    action.should.eql
      handler: (->)

  it 'get all', ->
    reg = registry.create()
    reg.register ['get', 'first', 'action'], (->)
    reg.register ['get', 'second', 'action'], (->)
    reg.get().should.eql
      get:
        first: action: '': handler: (->)
        second: action: '': handler: (->)

  it 'option `deprecated`', ->
    reg = registry.create()
    reg.register ['new', 'function'], handler: (->)
    reg.deprecate ['old', 'function'], ['new', 'function'], handler: (->)
    actions = reg.get deprecate: false
    actions['new']['function'][''].handler.should.be.type 'function'
    (actions['old'] is undefined).should.be.true()
    actions = reg.get deprecate: true
    actions['new']['function'][''].handler.should.be.type 'function'
    actions['old']['function'][''].handler.should.be.type 'function'

  it 'get all with flatten options', ->
    reg = registry.create()
    reg.register ['my', 'function'], handler: (->)
    actions = reg.get flatten: true
    actions.some( (action) -> action.action.join('.') is 'my.function').should.be.true()

  it 'get all with flatten options and deprecate', ->
    reg = registry.create()
    reg.register ['new', 'function'], handler: (->)
    reg.deprecate ['old', 'function'], ['new', 'function'], handler: (->)
    actions = reg.get flatten: true, deprecate: false
    actions.some( (action) -> action.action.join('.') is 'new.function').should.be.true()
    actions.some( (action) -> action.action.join('.') is 'old.function').should.be.false()
    actions = reg.get flatten: true, deprecate: true
    actions.some( (action) -> action.action.join('.') is 'new.function').should.be.true()
    actions.some( (action) -> action.action.join('.') is 'old.function').should.be.true()
