// Generated by CoffeeScript 2.5.1
// registration of `nikita.ldap` actions

//# Dependency
var register;

({register} = require('@nikitajs/core/lib/registry'));

//# Action registration
register({
  ldap: {
    acl: '@nikitajs/ldap/lib/acl',
    add: '@nikitajs/ldap/lib/add',
    delete: '@nikitajs/ldap/lib/delete',
    index: '@nikitajs/ldap/lib/index',
    schema: '@nikitajs/ldap/lib/schema',
    user: '@nikitajs/ldap/lib/user'
  }
});
