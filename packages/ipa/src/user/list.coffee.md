
# `nikita.ipa.user.list`

List the users registed inside FreeIPA. "https://ipa.domain.com/ipa/session/json"

## Exemple

```js
require('nikita')
.ipa.user.list({
  uid: 'someone',
  referer: 'https://my.domain.com',
  url: 'https://ipa.domain.com/ipa/session/json',
  principal: 'admin@DOMAIN.COM',
  password: 'XXXXXX'
}, function(err, {users}){
  console.info(err ? err.message : status ?
    'User was updated' : 'User was already set')
})
```