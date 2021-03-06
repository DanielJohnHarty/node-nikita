
# `nikita.ipa.service`

Add a service in FreeIPA.

## Options

* `principal` (string, required)   
  Name of the service to add.
* `connection` (object, required)   
  See the `nikita.connection.http` action.

## Exemple

```js
require('nikita')
.ipa.service({
  principal: "myprincipal/my.domain.com"
  },
  connection: {
    url: "https://ipa.domain.com/ipa/session/json",
    principal: "admin@DOMAIN.COM",
    password: "mysecret"
  }
}, function(){
  console.info(err ? err.message : status ?
    "Service was updated" : " Service was already set")
})
```

## Schema

    schema =
      type: 'object'
      properties:
        'principal': type: 'string'
        'connection':
          $ref: '/nikita/connection/http'
      required: ['connection', 'principal']

## Handler

    handler = ({options}, callback) ->
      options.connection.http_headers ?= {}
      options.connection.http_headers['Referer'] ?= options.connection.referer or options.connection.url
      throw Error "Required Option: principal is required, got #{options.connection.principal}" unless options.connection.principal
      throw Error "Required Option: password is required, got #{options.connection.password}" unless options.connection.password
      @ipa.service.exists
        connection: options.connection
        principal: options.principal
      @connection.http options.connection,
        negotiate: true
        method: 'POST'
        data:
          method: "service_add/1"
          params: [[options.principal], {}]
          id: 0
      , (error, {data}) ->
        if data?.error
          return callback null, false if data.error.code is 4002 # principal alredy exists
          error = Error data.error.message
          error.code = data.error.code
        callback error, true

## Exports

    module.exports =
      handler: handler
      schema: schema

## Dependencies

    string = require '@nikitajs/core/lib/misc/string'
    diff = require 'object-diff'
