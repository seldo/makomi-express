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
 *
 * @param rootDir
 * @param model
 * @param outputDir
 * @param cb
 */
exports.createModel = function(rootDir, modelName, cb) {

  // TODO: find the adapters required
  // TODO: foreach query, translate the queries into methods

  fs.readJSONFile(rootDir + modelName,function(er,model) {
  })

}

exports.createQuery = function(model,controller,action,cb) {

}
