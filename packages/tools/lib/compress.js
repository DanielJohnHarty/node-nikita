// Generated by CoffeeScript 2.5.1
// # `nikita.tools.compress`

// Compress an archive. Multiple compression types are supported. Unless
// specified as an option, format is derived from the source extension. At the
// moment, supported extensions are '.tgz', '.tar.gz', 'tar.xz', 'tar.bz2' and '.zip'.

// ## Options

// * `format`   
//   One of 'tgz', 'tar', 'xz', 'bz2' or 'zip'.   
// * `source`   
//   Archive to compress.   
// * `target`   
//   Default to the source parent directory.   
// * `clean`   
//   Remove the source file or directory

// ## Callback Parameters

// * `err`   
//   Error object if any.   
// * `status`   
//   Value is "true" if file was compressed.   

// ## Example

// ```javascript
// require('nikita')
// .tools.compress({
//   source: '/path/to/file.tgz'
//   destation: '/tmp'
// }, function(err, status){
//   console.log(err ? err.message : 'File was compressed: ' + status);
// });
// ```

// ## Source Code
var path;

module.exports = function({options}) {
  var dir, format, name;
  this.log({
    message: "Entering compress",
    level: 'DEBUG',
    module: 'nikita/lib/tools/compress'
  });
  if (!options.source) {
    // Validate parameters
    throw Error(`Missing source: ${options.source}`);
  }
  if (!options.target) {
    throw Error(`Missing target: ${options.target}`);
  }
  options.source = path.normalize(options.source);
  options.target = path.normalize(options.target);
  dir = path.dirname(options.source);
  name = path.basename(options.source);
  // Deal with format option
  if (options.format != null) {
    format = options.format;
  } else {
    format = module.exports.ext_to_type(options.target);
  }
  // Run compression
  this.system.execute((function() {
    switch (format) {
      case 'tgz':
        return `tar czf ${options.target} -C ${dir} ${name}`;
      case 'tar':
        return `tar cf  ${options.target} -C ${dir} ${name}`;
      case 'bz2':
        return `tar cjf ${options.target} -C ${dir} ${name}`;
      case 'xz':
        return `tar cJf ${options.target} -C ${dir} ${name}`;
      case 'zip':
        return `(cd ${dir} && zip -r ${options.target} ${name} && cd -)`;
    }
  })());
  return this.system.remove({
    if: options.clean,
    source: options.source
  });
};

// ## Type of extension
module.exports.type_to_ext = function(type) {
  if (type === 'tgz' || type === 'tar' || type === 'zip' || type === 'bz2' || type === 'xz') {
    return `.${type}`;
  }
  throw Error(`Unsupported Type: ${JSON.stringify(type)}`);
};

// ## Extention to type

// Convert a full path, a filename or an extension into a supported compression 
// type.
module.exports.ext_to_type = function(name) {
  if (/((.+\.)|^\.|^)(tar\.gz|tgz)$/.test(name)) {
    return 'tgz';
  } else if (/((.+\.)|^\.|^)tar$/.test(name)) {
    return 'tar';
  } else if (/((.+\.)|^\.|^)zip$/.test(name)) {
    return 'zip';
  } else if (/((.+\.)|^\.|^)bz2$/.test(name)) {
    return 'bz2';
  } else if (/((.+\.)|^\.|^)xz$/.test(name)) {
    return 'xz';
  } else {
    throw Error(`Unsupported Extension: ${JSON.stringify(path.extname(name))}`);
  }
};

// ## Dependencies
path = require('path');
