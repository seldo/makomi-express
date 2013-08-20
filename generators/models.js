var fs = require('fs-extra');
var _ = require('underscore');
var mkSrc = require('makomi-source-util')

/**
 * Given a model directory and an output directory, generate model
 * classes for all the models in an app and write them to disk.
 * @param rootDir
 * @param outputDir
 * @param devMode
 * @param cb
 */
exports.generate = function(rootDir, outputDir, devMode, cb) {

  // generate a model class for each model we find
  mkSrc.files.listJSON(rootDir,function(er,modelNames) {

    var count = modelNames.length;
    if (modelNames.length == 0) cb()
    var complete = function() {
      count--
      if (count==0) {
        console.log("All models generated")
        cb()
      }
    }

    modelNames.forEach(function(modelName,index) {
      exports.createModel(rootDir,modelName,function(modelCode) {
        mkSrc.files.writeToDir(outputDir,modelName+'.js',modelCode,function() {
          console.log("Generated " + modelName)
          complete();
        })
      })
    })
  })

}

/**
 * Read model format and output a model class.
 * @param rootDir
 * @param model
 * @param outputDir
 * @param cb
 */
exports.createModel = function(rootDir, modelName, cb) {
  fs.readJson(rootDir + modelName + '.json',function(er,model) {
    // TODO: find the adapters required
    // TODO: foreach query, translate the queries into methods
    var modelCode = ''

    modelCode += _.map(model.queries,function(query) {
      return exports.createQuery(query)
    }).join("\n")

    cb(modelCode)
  })

}

/**
 * Generate a single query class for a model
 * @param cb
 */
exports.createQuery = function(query) {
  return "// query goes here\n";
}
