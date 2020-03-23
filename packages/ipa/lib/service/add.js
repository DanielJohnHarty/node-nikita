// Generated by CoffeeScript 2.5.1
// # `nikita.ipa.service.add`

// Create a new FreeIPA service.

// ## Options

// * `referer` (string, ?required)   
//   The HTTP referer of the request, required unless provided inside the `Referer`
//   header.
// * `cn` (string, required)   
//   Name of the group to add.
// * `options.usercertificatemultivalued` (array[string])    
//   Base-64 encoded service certificate

// ## Exemple

// ```js
// require('nikita')
// .ipa.group.show({
//   cn: 'somegroup',
//   connection: {
//     referer: "https://my.domain.com",
//     url: "https://ipa.domain.com/ipa/session/json",
//     principal: "admin@DOMAIN.COM",
//     password: "mysecret"
//   }
// }, function(err, {result}){
//   console.info(err ? err.message :
//     `Group is ${result.cn[0]}`)
// })
// ```

// ## Schema
var handler, schema, string;

schema = {
  type: 'object',
  properties: {
    'cn': {
      type: 'string'
    },
    'attributes': {
      type: 'object',
      properties: {
        'user': {
          type: 'array',
          minItems: 1,
          uniqueItems: true,
          items: {
            type: 'string'
          }
        }
      }
    },
    'connection': {
      $ref: '/nikita/connection/http'
    }
  },
  required: ['cn', 'connection']
};

// ## Handler
handler = function({options}, callback) {
  var base, base1;
  if ((base = options.connection).http_headers == null) {
    base.http_headers = {};
  }
  if ((base1 = options.connection.http_headers)['Referer'] == null) {
    base1['Referer'] = options.connection.referer || options.connection.url;
  }
  if (!options.connection.principal) {
    throw Error(`Required Option: principal is required, got ${options.connection.principal}`);
  }
  if (!options.connection.password) {
    throw Error(`Required Option: password is required, got ${options.connection.password}`);
  }
  return this.connection.http(options.connection, {
    negotiate: true,
    method: 'POST',
    data: {
      method: "group_show/1",
      params: [[options.cn], {}],
      id: 0
    },
    http_headers: options.http_headers
  }, function(err, {data}) {
    var error;
    if (err) {
      return callback(err);
    }
    if (data.error) {
      error = Error(data.error.message);
      error.code = data.error.code;
      return callback(error);
    }
    return callback(null, {
      result: data.result.result
    });
  });
};

// ## Export
module.exports = {
  handler: handler,
  schema: schema
};

// ## Dependencies
string = require('@nikitajs/core/lib/misc/string');
