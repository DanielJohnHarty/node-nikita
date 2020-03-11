// Generated by CoffeeScript 2.5.1
// # `nikita.ipa.group.del`

// Delete a group from FreeIPA.

// ## Options

// * `cn` (string, required)   
//   Name of the group to delete.

// ## Exemple

// ```js
// require('nikita')
// .ipa.group.del({
//   cn: 'somegroup',
//   connection: {
//     url: "https://ipa.domain.com/ipa/session/json",
//     principal: "admin@DOMAIN.COM",
//     password: "mysecret"
//   }
// }, function(){
//   console.info(err ? err.message : status ?
//     'Group was updated' : 'Group was already set')
// })
// ```

// ## Schema
var diff, handler, schema, string;

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
handler = function({options}) {
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
  this.ipa.group.exists({
    connection: options.connection,
    shy: false,
    cn: options.cn
  });
  return this.connection.http(options.connection, {
    if: function() {
      return this.status(-1);
    },
    negotiate: true,
    method: 'POST',
    data: {
      method: "group_del/1",
      params: [[options.cn], {}],
      id: 0
    },
    http_headers: options.http_headers
  });
};

// ## Export
module.exports = {
  handler: handler,
  schema: schema
};

// ## Dependencies
string = require('@nikitajs/core/lib/misc/string');

diff = require('object-diff');
