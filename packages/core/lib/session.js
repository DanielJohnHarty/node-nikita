// Generated by CoffeeScript 2.5.1
// # Nikita Session
var EventEmitter, args_to_actions, array, conditions, each, make_action, path, promise, registry, schema, state_create_level, state_reset_level, string, util;

module.exports = function() {
  var action, actions, call_callback, handle_get, handle_multiple_call, i, jump_to_error, len, name, obj, proxy, run, run_next, state;
  if (arguments.length === 1) {
    obj = new EventEmitter();
    obj.options = arguments[0];
  } else {
    obj = new EventEmitter();
    obj.options = {};
  }
  if (obj.store == null) {
    obj.store = {};
  }
  obj.cascade = {...module.exports.cascade, ...obj.options.cascade};
  // Internal state
  state = {};
  state.parent_levels = [];
  state.current_level = state_create_level();
  state.befores = [];
  state.afters = [];
  state.once = {};
  state.killed = false;
  state.index_counter = 0;
  // Proxify
  proxy = new Proxy(obj, {
    has: function(target, name) {
      return console.warns('proxy has is being called', name);
    },
    apply: function(target, self, argumentsList) {
      return console.warn('apply');
    },
    get: function(target, name) {
      var get_proxy_builder;
      if (obj[name] != null) {
        return target[name];
      }
      if (name === '_events' || name === '_maxListeners') {
        return target[name];
      }
      proxy.action = [];
      proxy.action.push(name);
      if (!obj.registry.registered(proxy.action, {
        partial: true
      }) && !registry.registered(proxy.action, {
        partial: true
      })) {
        proxy.action = [];
        return void 0;
      }
      get_proxy_builder = function() {
        var builder;
        builder = function() {
          var args, get, i, len, options, opts, values;
          args = [].slice.call(arguments);
          options = args_to_actions(obj, args, proxy.action);
          proxy.action = [];
          ({get, values} = handle_get(proxy, options));
          if (get) {
            return values;
          }
          for (i = 0, len = options.length; i < len; i++) {
            opts = options[i];
            state.current_level.todos.push(opts);
          }
          if (state.current_level.todos.length === options.length) { // Activate the pump
            setImmediate(run_next);
          }
          return proxy;
        };
        return new Proxy(builder, {
          get: function(target, name) {
            if (target[name] != null) {
              return target[name];
            }
            proxy.action.push(name);
            if (!obj.registry.registered(proxy.action, {
              partial: true
            }) && !registry.registered(proxy.action, {
              partial: true
            })) {
              proxy.action = [];
              return void 0;
            }
            return get_proxy_builder();
          }
        });
      };
      return get_proxy_builder();
    }
  });
  handle_get = function(proxy, options) {
    var action, values;
    if (options.length !== 1) {
      return {
        get: false
      };
    }
    options = options[0];
    if (options.get !== true) {
      return {
        get: false
      };
    }
    action = make_action(obj, state.current_level.action, options);
    values = action.handler.call(proxy, action);
    return {
      get: true,
      values: values
    };
  };
  call_callback = function(action) {
    var current_level, error;
    state.parent_levels.unshift(state.current_level);
    state.current_level = state_create_level();
    state.current_level.action = action;
    try {
      action.callback.call(proxy, action.error, action.output, ...(action.args || []));
    } catch (error1) {
      error = error1;
      state.current_level = state.parent_levels.shift();
      action.error_in_callback = true;
      action.error = error;
      jump_to_error();
      return;
    }
    current_level = state.current_level;
    state.current_level = state.parent_levels.shift();
    if (current_level.todos.length) {
      return state.current_level.todos.unshift(...current_level.todos);
    }
  };
  handle_multiple_call = function(action, error) {
    state.killed = true;
    while (state.parent_levels.length) {
      state.current_level = state.parent_levels.shift();
    }
    action.error = error;
    state.current_level.history.push(action);
    jump_to_error();
    return run_next();
  };
  jump_to_error = function() {
    var ref, results;
    results = [];
    while (state.current_level.todos[0] && ((ref = state.current_level.todos[0].action) !== 'catch' && ref !== 'next' && ref !== 'promise')) {
      results.push(state.current_level.todos.shift());
    }
    return results;
  };
  run_next = function() {
    var error, errors, options;
    options = state.current_level.todos.shift();
    // Nothing more to do in current queue
    if (!options) {
      errors = state.current_level.history.map(function(action) {
        return (action.error_in_callback || !action.metadata.tolerant && !action.original.relax) && action.error;
      });
      error = errors[errors.length - 1];
      if (!state.killed && state.parent_levels.length === 0 && error && state.current_level.throw_if_error) {
        if (obj.listenerCount('error') === 0) {
          throw error;
        } else {
          obj.emit('error', error);
        }
      }
      if (state.parent_levels.length === 0) {
        if (!error) {
          obj.emit('end', {
            level: 'INFO'
          });
        }
      }
      return;
    }
    return run(options, function() {
      return run_next();
    });
  };
  run = function(options, callback) {
    var action, action_parent, error, errors, index, ref, ref1, status;
    if (!(options && callback)) {
      throw Error('Invalid Argument');
    }
    if (options.action === 'next') {
      errors = state.current_level.history.map(function(action) {
        return (action.error_in_callback || !action.metadata.tolerant && !action.original.relax) && action.error;
      });
      error = errors[errors.length - 1];
      status = state.current_level.history.some(function(action) {
        return !action.metadata.shy && action.status;
      });
      if ((ref = options.handler) != null) {
        ref.call(proxy, error, {
          status: status
        });
      }
      state_reset_level(state.current_level);
      return callback(null, {});
    }
    if (options.action === 'promise') {
      errors = state.current_level.history.map(function(action) {
        return (action.error_in_callback || !action.metadata.tolerant && !action.original.relax) && action.error;
      });
      // action.error and (action.error.fatal or (not action.metadata.tolerant and not action.original.relax))
      error = errors[errors.length - 1];
      status = state.current_level.history.some(function(action) {
        return !action.metadata.shy && action.status;
      });
      if ((ref1 = options.handler) != null) {
        ref1.call(proxy, error, status);
      }
      if (!error) {
        options.deferred.resolve(status);
      } else {
        options.deferred.reject(error);
      }
      state_reset_level(state.current_level);
      return callback(null, {});
    }
    if (state.killed) {
      return;
    }
    if (array.compare(options.action, ['end'])) {
      return conditions.all(proxy, {
        options: options
      }, function() {
        var ref2;
        while (state.current_level.todos[0] && ((ref2 = state.current_level.todos[0].action) !== 'next' && ref2 !== 'promise')) {
          state.current_level.todos.shift();
        }
        return callback(null, {});
      }, function(error) {
        return callback(error, {});
      });
    }
    index = state.index_counter++;
    action_parent = state.current_level.action;
    action = make_action(obj, action_parent, options);
    // Prepare the Context
    action.session = proxy;
    state.parent_levels.unshift(state.current_level);
    state.current_level = state_create_level();
    state.current_level.action = action;
    if (action.metadata.header) {
      proxy.log({
        message: action.metadata.header,
        type: 'header',
        index: index
      });
    }
    return (function() {
      var do_callback, do_conditions, do_disabled, do_end, do_handler, do_intercept_after, do_intercept_before, do_once, do_options, do_options_after, do_options_before;
      do_options = function() {
        try {
          if (action.on_options) {
            action.on_options(action);
          }
          if (action.metadata.schema) {
            errors = obj.schema.validate(action.options, action.metadata.schema);
            if (errors.length) {
              if (errors.length === 1) {
                error = errors[0];
              } else {
                error = new Error(`Invalid Options: got ${errors.length} errors\n${errors.map(function(error) {
                  return error.message;
                }).join('\n')}`);
                error.errors = errors;
              }
              error.options = action.options;
              error.action = action.action;
              throw error;
            }
          }
          if (!(typeof action.metadata.sleep === 'number' && action.metadata.sleep >= 0)) {
            // Validate sleep option, more can be added
            throw Error(`Invalid options sleep, got ${JSON.stringify(action.metadata.sleep)}`);
          }
        } catch (error1) {
          error = error1;
          action.error = error;
          action.output = {
            status: false
          };
          do_callback();
          return;
        }
        return do_disabled();
      };
      do_disabled = function() {
        if (!action.metadata.disabled) {
          proxy.log({
            type: 'lifecycle',
            message: 'disabled_false',
            level: 'DEBUG',
            index: index,
            error: null,
            status: false
          });
          return do_once();
        } else {
          proxy.log({
            type: 'lifecycle',
            message: 'disabled_true',
            level: 'INFO',
            index: index,
            error: null,
            status: false
          });
          action.error = void 0;
          action.output = {
            status: false
          };
          return do_callback();
        }
      };
      do_once = function() {
        var hash, hashme;
        hashme = function(value) {
          if (typeof value === 'string') {
            value = `string:${string.hash(value)}`;
          } else if (typeof value === 'boolean') {
            value = `boolean:${value}`;
          } else if (typeof value === 'function') {
            value = `function:${string.hash(value.toString())}`;
          } else if (value === void 0 || value === null) {
            value = 'null';
          } else if (Array.isArray(value)) {
            value = 'array:' + value.sort().map(function(value) {
              return hashme(value);
            }).join(':');
          } else if (typeof value === 'object') {
            value = 'object';
          } else {
            throw Error(`Invalid data type: ${JSON.stringify(value)}`);
          }
          return value;
        };
        if (action.metadata.once) {
          if (typeof action.metadata.once === 'string') {
            hash = string.hash(action.metadata.once);
          } else if (Array.isArray(action.metadata.once)) {
            hash = string.hash(action.metadata.once.map(function(k) {
              // TODO, we need a more reliable way to detect metadata,
              // options and other action properties
              if (k === 'handler') {
                return hashme(action.handler);
              } else if (make_action.metadata[k] !== void 0) {
                return hashme(action.metadata[k]);
              } else {
                return hashme(action.options[k]);
              }
            }).join('|'));
          } else {
            throw Error(`Invalid Option 'once': ${JSON.stringify(action.metadata.once)} must be a string or an array of string`);
          }
          if (state.once[hash]) {
            action.error = void 0;
            action.output = {
              status: false
            };
            return do_callback();
          }
          state.once[hash] = true;
        }
        return do_options_before();
      };
      do_options_before = function() {
        var base;
        if (action.original.options_before) {
          return do_intercept_before();
        }
        if ((base = action.metadata).before == null) {
          base.before = [];
        }
        if (!Array.isArray(action.metadata.before)) {
          action.metadata.before = [action.metadata.before];
        }
        return each(action.metadata.before).call(function(before, next) {
          var _opts, k, ref2, v;
          [before] = args_to_actions(obj, [before], 'call');
          _opts = {
            options_before: true
          };
          for (k in before) {
            v = before[k];
            _opts[k] = v;
          }
          ref2 = action.options;
          for (k in ref2) {
            v = ref2[k];
            if (_opts[k] == null) {
              _opts[k] = v;
            }
          }
          return run(_opts, next);
        }).error(function(error) {
          action.error = error;
          action.output = {
            status: false
          };
          return do_callback();
        }).next(do_intercept_before);
      };
      do_intercept_before = function() {
        if (action.options.intercepting) {
          return do_conditions();
        }
        return each(state.befores).call(function(before, next) {
          var _opts, k, ref2, ref3, ref4, v;
          if (before.action) {
            if (!array.compare(before.action, action.action)) {
              return next();
            }
          }
          if (before.metadata) {
            ref2 = before.metadata;
            for (k in ref2) {
              v = ref2[k];
              if (v !== action.metadata[k]) {
                return next();
              }
            }
          }
          if (before.options) {
            ref3 = before.options;
            for (k in ref3) {
              v = ref3[k];
              if (v !== action.options[k]) {
                return next();
              }
            }
          }
          _opts = {
            intercepting: true
          };
          for (k in before) {
            v = before[k];
            _opts[k] = v;
          }
          ref4 = action.options;
          for (k in ref4) {
            v = ref4[k];
            if (_opts[k] == null) {
              _opts[k] = v;
            }
          }
          return run(_opts, next);
        }).error(function(error) {
          action.error = error;
          action.output = {
            status: false
          };
          return do_callback();
        }).next(do_conditions);
      };
      do_conditions = function() {
        var _opts, k, ref2, v;
        _opts = {};
        ref2 = action.options;
        for (k in ref2) {
          v = ref2[k];
          if (_opts[k] == null) {
            _opts[k] = v;
          }
        }
        return conditions.all(proxy, {
          options: _opts,
          metadata: action.metadata
        }, function() {
          var ref3;
          proxy.log({
            type: 'lifecycle',
            message: 'conditions_passed',
            index: index,
            error: null,
            status: false
          });
          ref3 = action.options;
          // Remove conditions from options
          for (k in ref3) {
            v = ref3[k];
            if (/^if.*/.test(k) || /^unless.*/.test(k)) {
              delete action.options[k];
            }
          }
          return setImmediate(function() {
            return do_handler();
          });
        }, function(error) {
          proxy.log({
            type: 'lifecycle',
            message: 'conditions_failed',
            index: index,
            error: error,
            status: false
          });
          return setImmediate(function() {
            action.error = error;
            action.output = {
              status: false
            };
            return do_callback();
          });
        });
      };
      do_handler = function() {
        var called, ctx, do_next, handle_async_and_promise, promise_returned, ref2, ref3, result, status_sync, wait_children;
        action.metadata.attempt++;
        do_next = function({error, output, args}) {
          var base, base1;
          action.error = error != null ? error : void 0; // ensure null is converted to undefined
          action.output = output;
          action.args = args;
          if (error && !(error instanceof Error)) {
            error = Error('First argument not a valid error');
            action.error = error;
            if (action.output == null) {
              action.output = {};
            }
            if ((base = action.output).status == null) {
              base.status = false;
            }
          } else {
            if (typeof output === 'boolean') {
              action.output = {
                status: output
              };
            } else if (!output) {
              action.output = {
                status: false
              };
            } else if (typeof output !== 'object') {
              action.error = Error(`Invalid Argument: expect an object or a boolean, got ${JSON.stringify(output)}`);
            } else {
              if ((base1 = action.output).status == null) {
                base1.status = false;
              }
            }
          }
          if (error) {
            proxy.log({
              message: error.message,
              level: 'ERROR',
              index: index,
              module: 'nikita'
            });
          }
          if (error && (action.metadata.retry === true || action.metadata.attempt < action.metadata.retry - 1)) {
            proxy.log({
              message: `Retry on error, attempt ${action.metadata.attempt + 1}`,
              level: 'WARN',
              index: index,
              module: 'nikita'
            });
            return setTimeout(do_handler, action.metadata.sleep);
          }
          return do_intercept_after();
        };
        if (action.handler == null) {
          action.handler = ((ref2 = obj.registry.get(action.action)) != null ? ref2.handler : void 0) || ((ref3 = registry.get(action.action)) != null ? ref3.handler : void 0);
        }
        if (!action.handler) {
          return handle_multiple_call(action, Error(`Unregistered Middleware: ${action.action.join('.')}`));
        }
        called = false;
        try {
          if (action.metadata.deprecate) {
            // Handle deprecation
            action.handler = (function(options_handler) {
              return util.deprecate(function() {
                return options_handler.apply(this, arguments);
              }, action.metadata.deprecate === true ? `${action.action.join('/')} is deprecated` : `${action.action.join('/')} is deprecated, use ${action.metadata.deprecate}`);
            })(action.handler);
          }
          handle_async_and_promise = function() {
            var args, output;
            [error, output, ...args] = arguments;
            if (state.killed) {
              return;
            }
            if (called) {
              return handle_multiple_call(action, Error('Multiple call detected'));
            }
            called = true;
            return setImmediate(function() {
              return do_next({
                error: error,
                output: output,
                args: args
              });
            });
          };
          // Prepare the context
          ctx = {
            ...action,
            options: {...action.options}
          };
          // Async style
          if (action.handler.length === 2) {
            promise_returned = false;
            result = action.handler.call(proxy, ctx, function() {
              if (promise_returned) {
                return;
              }
              return handle_async_and_promise.apply(null, arguments);
            });
            if (promise.is(result)) {
              promise_returned = true;
              return handle_async_and_promise(Error('Invalid Promise: returning promise is not supported in asynchronuous mode'));
            }
          } else {
            // Sync style
            result = action.handler.call(proxy, ctx);
            if (promise.is(result)) {
              return result.then(function(value) {
                var args, output;
                if (Array.isArray(value)) {
                  [output, ...args] = value;
                } else {
                  output = value;
                  args = [];
                }
                return handle_async_and_promise(void 0, output, ...args);
              }, function(reason) {
                if (reason == null) {
                  reason = Error('Rejected Promise: reject called without any arguments');
                }
                return handle_async_and_promise(reason);
              });
            } else {
              if (state.killed) {
                return;
              }
              if (called) {
                return handle_multiple_call(action, Error('Multiple call detected'));
              }
              called = true;
              status_sync = false;
              wait_children = function() {
                var loptions;
                if (!state.current_level.todos.length) {
                  return setImmediate(function() {
                    return do_next({
                      output: {
                        status: status_sync
                      }
                    });
                  });
                }
                loptions = state.current_level.todos.shift();
                return run(loptions, function(error, {status}) {
                  var ref4;
                  if (error) {
                    return do_next({
                      error: error
                    });
                  }
                  if (status && !(loptions.shy || ((ref4 = loptions.metadata) != null ? ref4.shy : void 0))) {
                    // Discover status of all unshy children
                    status_sync = true;
                  }
                  return wait_children();
                });
              };
              return wait_children();
            }
          }
        } catch (error1) {
          error = error1;
          state.current_level = state_create_level();
          return do_next({
            error: error
          });
        }
      };
      do_intercept_after = function() {
        if (action.options.intercepting) {
          return do_options_after();
        }
        return each(state.afters).call(function(after, next) {
          var _opts, k, ref2, ref3, ref4, v;
          if (after.action) {
            if (!array.compare(after.action, action.action)) {
              return next();
            }
          }
          if (after.metadata) {
            ref2 = after.metadata;
            for (k in ref2) {
              v = ref2[k];
              if (v !== action.metadata[k]) {
                return next();
              }
            }
          }
          if (after.options) {
            ref3 = after.options;
            for (k in ref3) {
              v = ref3[k];
              if (v !== action.options[k]) {
                return next();
              }
            }
          }
          _opts = {
            intercepting: true
          };
          for (k in after) {
            v = after[k];
            _opts[k] = v;
          }
          ref4 = action.options;
          for (k in ref4) {
            v = ref4[k];
            if (_opts[k] == null) {
              _opts[k] = v;
            }
          }
          return run(_opts, next);
        }).error(function(error) {
          action.error = error;
          action.output = {
            status: false
          };
          return do_callback();
        }).next(function() {
          return do_options_after();
        });
      };
      do_options_after = function() {
        var base;
        if (action.original.options_after) {
          return do_callback();
        }
        if ((base = action.metadata).after == null) {
          base.after = [];
        }
        if (!Array.isArray(action.metadata.after)) {
          action.metadata.after = [action.metadata.after];
        }
        return each(action.metadata.after).call(function(after, next) {
          var _opts, k, ref2, v;
          [after] = args_to_actions(obj, [after], 'call');
          _opts = {
            options_after: true
          };
          for (k in after) {
            v = after[k];
            _opts[k] = v;
          }
          ref2 = action.options;
          for (k in ref2) {
            v = ref2[k];
            if (_opts[k] == null) {
              _opts[k] = v;
            }
          }
          return run(_opts, next);
        }).error(function(error) {
          action.error = error;
          action.output = {
            status: false
          };
          return do_callback();
        }).next(function() {
          return do_callback();
        });
      };
      do_callback = function() {
        proxy.log({
          type: 'handled',
          index: index,
          error: action.error,
          status: action.output.status
        });
        if (state.killed) {
          return;
        }
        state.current_level = state.parent_levels.shift(); // Exit action state and move back to parent state
        if (action.error && action.callback) {
          state.current_level.throw_if_error = false;
        }
        action.status = action.metadata.status ? action.output.status : false;
        if (action.error && !action.metadata.relax) {
          jump_to_error();
        }
        if (action.callback) {
          call_callback(action);
        }
        return do_end(action);
      };
      do_end = function(action) {
        state.current_level.history.push(action);
        error = (action.error_in_callback || !action.metadata.tolerant && !action.original.relax) && action.error;
        return callback(error, action.output);
      };
      return do_options();
    })();
  };
  obj.next = function() {
    state.current_level.todos.push({
      action: 'next',
      handler: arguments[0]
    });
    if (state.current_level.todos.length === 1) { // Activate the pump
      setImmediate(run_next);
    }
    return proxy;
  };
  obj.promise = function() {
    var deferred, promise;
    deferred = {};
    promise = new Promise(function(resolve, reject) {
      deferred.resolve = resolve;
      return deferred.reject = reject;
    });
    state.current_level.todos.push({
      action: 'promise',
      deferred: deferred
    });
    if (state.current_level.todos.length === 1) { // Activate the pump
      setImmediate(run_next);
    }
    return promise;
  };
  obj.end = function() {
    var args, i, len, options, opts;
    args = [].slice.call(arguments);
    options = args_to_actions(obj, args, 'end');
    for (i = 0, len = options.length; i < len; i++) {
      opts = options[i];
      state.current_level.todos.push(opts);
    }
    if (state.current_level.todos.length === options.length) { // Activate the pump
      setImmediate(run_next);
    }
    return proxy;
  };
  obj.call = function() {
    var args, get, i, len, options, opts, values;
    args = [].slice.call(arguments);
    options = args_to_actions(obj, args, 'call');
    ({get, values} = handle_get(proxy, options));
    if (get) {
      return values;
    }
    for (i = 0, len = options.length; i < len; i++) {
      opts = options[i];
      state.current_level.todos.push(opts);
    }
    if (state.current_level.todos.length === options.length) { // Activate the pump
      setImmediate(run_next);
    }
    return proxy;
  };
  obj.each = function() {
    var arg, args, i, j, key, len, len1, options, opts, value;
    args = [].slice.call(arguments);
    arg = args.shift();
    if ((arg == null) || typeof arg !== 'object') {
      throw Error(`Invalid Argument: first argument must be an array or an object to iterate, got ${JSON.stringify(arg)}`);
    }
    options = args_to_actions(obj, args, 'call');
    for (i = 0, len = options.length; i < len; i++) {
      opts = options[i];
      if (Array.isArray(arg)) {
        for (j = 0, len1 = arg.length; j < len1; j++) {
          key = arg[j];
          opts.key = key;
          this.call(opts);
        }
      } else {
        for (key in arg) {
          value = arg[key];
          opts.key = key;
          opts.value = value;
          this.call(opts);
        }
      }
    }
    return proxy;
  };
  obj.before = function() {
    var i, len, options, opts;
    if (typeof arguments[0] === 'string' || Array.isArray(arguments[0])) {
      arguments[0] = {
        action: arguments[0]
      };
    }
    options = args_to_actions(obj, arguments, null);
    for (i = 0, len = options.length; i < len; i++) {
      opts = options[i];
      if (typeof opts.handler !== 'function') {
        throw Error(`Invalid handler ${JSON.stringify(opts.handler)}`);
      }
      state.befores.push(opts);
    }
    return proxy;
  };
  obj.after = function() {
    var i, len, options, opts;
    if (typeof arguments[0] === 'string' || Array.isArray(arguments[0])) {
      arguments[0] = {
        action: arguments[0]
      };
    }
    options = args_to_actions(obj, arguments, null);
    for (i = 0, len = options.length; i < len; i++) {
      opts = options[i];
      if (typeof opts.handler !== 'function') {
        throw Error(`Invalid handler ${JSON.stringify(opts.handler)}`);
      }
      state.afters.push(opts);
    }
    return proxy;
  };
  obj.status = function(index) {
    var action, i, j, l, len, len1, ref, ref1, ref2, ref3, status;
    if (arguments.length === 0) {
      return state.parent_levels[0].history.some(function(action) {
        return !action.metadata.shy && action.status;
      });
    } else if (index === false) {
      status = state.parent_levels[0].history.some(function(action) {
        return !action.metadata.shy && action.status;
      });
      ref = state.parent_levels[0].history;
      for (i = 0, len = ref.length; i < len; i++) {
        action = ref[i];
        action.status = false;
      }
      return status;
    } else if (index === true) {
      status = state.parent_levels[0].history.some(function(action) {
        return !action.metadata.shy && action.status;
      });
      ref1 = state.parent_levels[0].history;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        action = ref1[j];
        action.status = true;
      }
      return status;
    } else if (index === 0) {
      return (ref2 = state.current_level.action.output) != null ? ref2.status : void 0;
    } else {
      l = state.parent_levels[0].history.length;
      if (index < 0) {
        index = l + index;
      }
      return (ref3 = state.parent_levels[0].history[index]) != null ? ref3.status : void 0;
    }
  };
  obj.schema = schema();
  actions = registry.get({
    flatten: true
  });
  for (i = 0, len = actions.length; i < len; i++) {
    action = actions[i];
    if (action.schema) {
      name = `/nikita/${action.action.join('/')}`;
      obj.schema.add(action.schema, name);
    }
  }
  // obj.schema.add action.schema, action.schema.name if action.schema.name
  obj.registry = registry.registry({
    parent: registry,
    chain: proxy,
    on_register: function(name, action) {
      if (!action.schema) {
        return;
      }
      name = `/nikita/${name.join('/')}`;
      return obj.schema.add(action.schema, name);
    }
  });
  // obj.schema.add action.schema, action.schema.name if action.schema.name
  // Todo: remove
  if (obj.options.ssh) {
    if (obj.options.ssh.config) {
      obj.store['nikita:ssh:connection'] = obj.options.ssh;
      delete obj.options.ssh;
    } else {
      if (!obj.options.no_ssh) {
        proxy.ssh.open(obj.options.ssh);
      }
    }
  }
  return proxy;
};

module.exports.cascade = {
  after: false,
  before: false,
  callback: false,
  cascade: true,
  cwd: true,
  debug: true,
  depth: null,
  disabled: null,
  handler: false,
  header: null,
  log: true,
  once: false,
  relax: false,
  shy: false,
  sleep: false,
  ssh: true,
  stdout: true,
  stderr: true,
  sudo: true,
  tolerant: false
};

// ## Helper functions
state_create_level = function() {
  return {
    error: void 0,
    history: [],
    todos: [],
    throw_if_error: true
  };
};

// Called after next and promise
state_reset_level = function(level) {
  level.error = void 0;
  level.history = [];
  return level.throw_if_error = true;
};

// ## Dependencies
args_to_actions = require('./engine/args_to_actions');

make_action = require('./engine/make_action');

schema = require('./engine/schema');

registry = require('./registry');

each = require('each');

path = require('path');

util = require('util');

array = require('./misc/array');

promise = require('./misc/promise');

conditions = require('./misc/conditions');

string = require('./misc/string');

({EventEmitter} = require('events'));
