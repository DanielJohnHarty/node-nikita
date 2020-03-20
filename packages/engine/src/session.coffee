
{merge} = require 'mixme'
registry = require './registry'
schedule = require './schedule'
args_to_actions = require './args_to_actions'

session = (action={}) ->
  # if typeof action is 'function'
  #   action = handler: action
  action = merge
    metadata:
      namespace: []
    state:
      namespace: []
  , action
  action.metadata.depth ?= 0
  # Local scheduler
  scheduler = schedule() # action.metadata.namespace.join '.'
  setImmediate ->
    scheduler.pump()
  on_call = () ->
    # Extract action namespace and reset the state
    namespace = action.state.namespace.slice()
    action.state.namespace = []
    # Validate the namespace
    unless action.registry.registered namespace
      throw Error "No action named #{namespace.join '.'}"
    # Are we scheduling multiple actions
    args = [].slice.call arguments
    args_is_array = args.some (arg) -> Array.isArray arg
    # Convert arguments to actions
    actions = args_to_actions [
      metadata:
        namespace: namespace
        depth: action.metadata.depth + 1
      parent: action
      ...args
    ]
    proms = actions.map (action) ->
      new Promise (resolve, reject) ->
        sch = ->
          session action
          .then resolve, reject
        scheduler.add sch
    prom = if args_is_array then Promise.all(proms) else proms[0]
    new Proxy prom, get: on_get
  on_get = (target, name) ->
    return target[name].bind target if target[name]?
    if action.state.namespace.length is 0 and name is 'registry'
      return action.registry
    action.state.namespace.push name
    unless action.registry.registered action.state.namespace, partial: true
      action.state.namespace = []
      return undefined
    new Proxy on_call, get: on_get
  # Execute the action
  result = new Promise (resolve, reject) ->
    # Make sure the promise is resolved after the scheduler and its children
    on_end = new Promise (resolve, reject) ->
      scheduler.on_end ->
        resolve()
    # Wait a bit, action.registry is not yet available
    setImmediate ->
      if action.metadata.namespace
        action_from_registry = action.registry.get action.metadata.namespace
        action = merge action_from_registry, action
      context = new Proxy on_call, get: on_get
      output = action.handler.call context, action
      unless output and output.then
        output = new Promise (resolve, reject) ->
          resolve output
      Promise.all([output, on_end])
      .catch reject
      .then (values) ->
        resolve values.shift()
  # Returning a promise:
  # - news action can be registered to it as long as the promised has not fulfilled
  # - resolve when all registered actions are fulfilled
  # - resolved with the result of handler
  proxy = new Proxy result, get: on_get
  # Create the registry and path the proxy reference for chaining
  action.registry ?= registry.create
    chain: proxy
    parent: if action.parent then action.parent.registry else registry
  proxy

module.exports = (action) ->
  # scheduler = schedule()
  # # Are we scheduling multiple actions
  args = [].slice.call arguments
  args_is_array = args.some (arg) -> Array.isArray arg
  throw Error 'Invalid Session Argument: array is not accepted to initialize a session' if args_is_array
  # Convert arguments to actions
  [action] = args_to_actions args
  session action
  # console.log 'action', action
  # namespace = action?.metadata?.namespace or []
  # console.log 'namespace', namespace
  # app = session()
  # for property in namespace
  #   console.log 'property', property
  #   app = app[property]
  # console.log '!!!!', app
  # app.apply app, action
  