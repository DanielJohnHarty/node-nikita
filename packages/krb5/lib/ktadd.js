// Generated by CoffeeScript 2.5.1
// # `nikita.krb5.ktadd(options, [callback])`

// Create and manage a keytab. This function is usually not used directly but instead
// called by the `krb5.addprinc` function.

// ## Options

// * `admin.server`   
//   Address of the kadmin server; optional, use "kadmin.local" if missing.   
// * `admin.principal`   
//   KAdmin principal name unless `kadmin.local` is used.   
// * `admin.password`   
//   Password associated to the KAdmin principal.   
// * `principal`   
//   Principal to be created.   
// * `keytab`   
//   Path to the file storing key entries.   

// ## Example

// ```
// require('nikita')
// .krb5_delrinc({
//   principal: 'myservice/my.fqdn@MY.REALM',
//   keytab: '/etc/security/keytabs/my.service.keytab',
//   admin: {
//     principal: 'me/admin@MY_REALM',
//     password: 'pass',
//     server: 'localhost'
//   }
// }, function(err, status){
//   console.info(err ? err.message : 'Principal removed: ' + status);
// });
// ```

// ## Hooks
var handler, mutate, on_options, path, string;

on_options = function({options}) {
  // Import all properties from `options.krb5`
  if (options.krb5) {
    mutate(options, options.krb5);
    return delete options.krb5;
  }
};

// ## Handler
handler = function({options}) {
  var keytab, princ;
  if (!options.principal) {
    throw Error('Property principal is required');
  }
  if (!options.keytab) {
    throw Error('Property keytab is required');
  }
  if (/^\S+@\S+$/.test(options.admin.principal)) {
    if (options.realm == null) {
      options.realm = options.admin.principal.split('@')[1];
    }
  } else {
    if (!options.realm) {
      throw Error('Property "realm" is required unless present in principal');
    }
    options.principal = `${options.principal}@${options.realm}`;
  }
  keytab = {}; // keytab[principal] ?= {kvno: null, mdate: null}
  princ = {}; // {kvno: null, mdate: null}
  // Get keytab information
  this.system.execute({
    cmd: `export TZ=GMT; klist -kt ${options.keytab}`,
    code_skipped: 1,
    shy: true
  }, function(err, {status, stdout}) {
    var _, i, kvno, len, line, match, mdate, principal, ref, results;
    if (err) {
      throw err;
    }
    if (!status) {
      return;
    }
    this.log({
      message: "Keytab exists, check kvno validity",
      level: 'DEBUG',
      module: 'nikita/krb5/ktadd'
    });
    ref = string.lines(stdout);
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      line = ref[i];
      if (!(match = /^\s*(\d+)\s+([\d\/:]+\s+[\d\/:]+)\s+(.*)\s*$/.exec(line))) {
        continue;
      }
      [_, kvno, mdate, principal] = match;
      kvno = parseInt(kvno, 10);
      mdate = Date.parse(`${mdate} GMT`);
      // keytab[principal] ?= {kvno: null, mdate: null}
      if (!keytab[principal] || keytab[principal].kvno < kvno) {
        results.push(keytab[principal] = {
          kvno: kvno,
          mdate: mdate
        });
      } else {
        results.push(void 0);
      }
    }
    return results;
  });
  // Get principal information
  this.krb5.execute({
    admin: options.admin,
    cmd: `getprinc -terse ${options.principal}`,
    shy: true,
    if: function() {
      return keytab[options.principal] != null;
    }
  }, function(err, {status, stdout}) {
    var kvno, mdate, ref, ref1, values;
    if (err) {
      return err;
    }
    if (!status) {
      return;
    }
    // return do_ktadd() unless -1 is stdout.indexOf 'does not exist'
    values = string.lines(stdout)[1];
    if (!values) {
      // Check if a ticket exists for this
      throw Error(`Principal does not exist: '${options.principal}'`);
    }
    values = values.split('\t');
    mdate = parseInt(values[2], 10) * 1000;
    kvno = parseInt(values[8], 10);
    princ = {
      mdate: mdate,
      kvno: kvno
    };
    this.log({
      message: `Keytab kvno '${(ref = keytab[options.principal]) != null ? ref.kvno : void 0}', principal kvno '${princ.kvno}'`,
      level: 'INFO',
      module: 'nikita/krb5/ktadd'
    });
    return this.log({
      message: `Keytab mdate '${new Date((ref1 = keytab[options.principal]) != null ? ref1.mdate : void 0)}', principal mdate '${new Date(princ.mdate)}'`,
      level: 'INFO',
      module: 'nikita/krb5/ktadd'
    });
  });
  // Remove principal from keytab
  this.krb5.execute({
    admin: options.admin,
    cmd: `ktremove -k ${options.keytab} ${options.principal}`,
    if: function() {
      var ref;
      return (keytab[options.principal] != null) && (((ref = keytab[options.principal]) != null ? ref.kvno : void 0) !== princ.kvno || keytab[options.principal].mdate !== princ.mdate);
    }
  });
  // Create keytab and add principal
  this.system.mkdir({
    target: `${path.dirname(options.keytab)}`,
    if: function() {
      var ref;
      return (keytab[options.principal] == null) || (((ref = keytab[options.principal]) != null ? ref.kvno : void 0) !== princ.kvno || keytab[options.principal].mdate !== princ.mdate);
    }
  });
  this.krb5.execute({
    admin: options.admin,
    cmd: `ktadd -k ${options.keytab} ${options.principal}`,
    if: function() {
      var ref;
      return (keytab[options.principal] == null) || (((ref = keytab[options.principal]) != null ? ref.kvno : void 0) !== princ.kvno || keytab[options.principal].mdate !== princ.mdate);
    }
  });
  // Keytab ownership and permissions
  this.system.chown({
    target: options.keytab,
    uid: options.uid,
    gid: options.gid,
    if: (options.uid != null) || (options.gid != null)
  });
  return this.system.chmod({
    target: options.keytab,
    mode: options.mode,
    if: options.mode != null
  });
};

// ## Export
module.exports = {
  handler: handler,
  on_options: on_options
};

// ## Fields in 'getprinc -terse' output

// princ-canonical-name
// princ-exp-time
// last-pw-change
// pw-exp-time
// princ-max-life
// modifying-princ-canonical-name
// princ-mod-date
// princ-attributes <=== This is the field you want
// princ-kvno
// princ-mkvno
// princ-policy (or 'None')
// princ-max-renewable-life
// princ-last-success
// princ-last-failed
// princ-fail-auth-count
// princ-n-key-data
// ver
// kvno
// data-type[0]
// data-type[1]

// ## Dependencies
path = require('path');

string = require('@nikitajs/core/lib/misc/string');

({mutate} = require('mixme'));
