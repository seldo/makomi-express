/**
 * Given a file "object", which contains a name and the file body, write that file
 * We are given the output dir for all these.
 * We may need some logic here to handle wacky/erroneous output locations/names.
 * @param fileObject
 * @param outputDir
 * @param cb
 */
exports.writeFile = function (data, path, outputDir, cb) {

  var fs = require('fs');

  console.log("Writing to " + path)

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