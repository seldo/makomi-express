var fs = require('fs-extra');
var _ = require('underscore');
var mkSrc = require('makomi-source-util')

exports.generate = function(rootDir, outputDir, devMode, cb) {

  // TODO: foreach model in rootdir, generate a model class

}

exports.createModel = function(rootDir, model, outputDir, cb) {

  // TODO: find the adapters required
  // TODO: foreach query, translate the queries into methods

}

exports.createQuery = function(model,controller,action,cb) {

}

// TODO: move these to util, and refactor controllers to use them



// TODO: replace with readJSONFile, writeJSONFile, etc.

/**
 * Read in the file. Maybe also validate it here in future.
 * @param routingFile
 * @param cb
 */
exports.read = function (file, cb) {
  fs.readFile(file, 'utf-8', cb);
}

/**
 * Trivial to parse because it's JSON. Some validation a good idea in future.
 * @param routerString
 * @param cb
 */
exports.parse = function (fileString, cb) {
  var parsed = JSON.parse(fileString);
  // FIXME: catch errors, send them instead of always null
  var er = null;
  cb(er, parsed);
}

/**
 * Given a file "object", which contains a name and the file body, write that file
 * We are given the output dir for all these.
 * We may need some logic here to handle wacky/erroneous output locations/names.
 * @param fileObject
 * @param outputDir
 * @param cb
 */
exports.write = function (dir, name, body, cb) {

  var path = dir + name
  fs.writeFile(path, body, function (er) {
    if (er) {
      console.log(er);
    } else {
      console.log("Wrote " + path);
    }
    cb(er);
  });

}