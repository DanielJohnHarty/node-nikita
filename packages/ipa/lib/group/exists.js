// Generated by CoffeeScript 2.4.1
// # `nikita.ipa.group.exists`

// Check if a group exists inside FreeIPA.

// ## Options

// * `referer` (string, ?required)   
//   The HTTP referer of the request, required unless provided inside the `Referer`
//   header.
// * `cn` (string, required)   
//   Name of the group to check for existence.
// * `url` (string, required)    
//   The IPA HTTP endpoint, for example "https://ipa.domain.com/ipa/session/json"

// ## Exemple

// ```js
// require('nikita')
// .ipa.group.exists({
//   cn: 'somegroup',
//   referer: 'https://my.domain.com',
//   url: 'https://ipa.domain.com/ipa/session/json',
//   principal: 'admin@DOMAIN.COM',
//   password: 'XXXXXX'
// }, function(err, {status, exists}){
//   console.info(err ? err.message : status ?
//     'Group was updated' : 'Group was already set')
// })
// ```
var diff, string;

module.exports = {
  shy: true,
  handler: function({options}, callback) {
    var base, base1;
    if (options.http_headers == null) {
      options.http_headers = {};
    }
    if ((base = options.http_headers)['Accept'] == null) {
      base['Accept'] = 'applicaton/json';
    }
    if ((base1 = options.http_headers)['Referer'] == null) {
      base1['Referer'] = options.referer;
    }
    if (!options.cn) {
      throw Error(`Required Option: cn is required, got ${options.cn}`);
    }
    if (!options.url) {
      throw Error(`Required Option: url is required, got ${options.url}`);
    }
    if (!options.principal) {
      throw Error(`Required Option: principal is required, got ${options.principal}`);
    }
    if (!options.password) {
      throw Error(`Required Option: password is required, got ${options.password}`);
    }
    if (!options.http_headers['Referer']) {
      throw Error(`Required Option: referer is required, got ${options.http_headers['Referer']}`);
    }
    return this.ipa.group.show(options, {
      cn: options.cn,
      relax: true
    }, function(err) {
      var exists;
      if (err && err.code !== 4001) {
        return callback(err);
      }
      exists = !err;
      return callback(null, {
        status: exists,
        exists: exists
      });
    });
  }
};


// ## Dependencies
string = require('@nikitajs/core/lib/misc/string');

diff = require('object-diff');
