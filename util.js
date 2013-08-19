var fs = require('fs');

/**
 * Write data to the combined path + outputDir
 * @param fileObject
 * @param outputDir
 * @param cb
 */
exports.writeFile = function (data, path, outputDir, cb) {
  var fullPath = outputDir + path
  fs.writeFile(fullPath, data, function (er) {
    if (er) {
      console.log(er);
    } else {
      console.log("Wrote " + fullPath);
    }
    cb(er);
  });
}

