/**
 * Controller generator tests
 * @type {*}
 */
var test = require('tape');
var generator = require('../../generators/controllers.js');
var fs = require('fs-extra');
var _ = require('underscore');

test('generate controllers', function (t) {

  var rootDir = "./test/data/testapp1/.makomi/controllers/"
  var outputDir = "/tmp/controllers/";
  var expectedFiles = {
    "basic": ["flat"],
    "index": ["index"],
    "news": ["more"],
    "users": ["list","self","show"]
  }
  // A teeny-tiny mapreduce to count the number of elements
  // We add 1 because each folder contains an _actions file too
  var totalFiles = _.reduce(
    _.map(expectedFiles,function(value,key,list) {
      return value.length + 1
    }),
    function(memo, num){
      return memo + num;
    },
    0
  );

  t.plan(totalFiles)

  // ensure our output directory exists
  fs.mkdir(outputDir,null,function() {
    // run the generator
    generator.generate(rootDir,outputDir,false,function() {
      // count files for each folder
      _.map(expectedFiles,function(controllerFiles,controller,list) {
        controllerFiles.forEach(function(file) {
          var controllerFile = outputDir+controller+'/'+file+'.js'
          fs.exists(controllerFile,function(exists) {
            t.ok(exists,controllerFile + " exists")
          })
        })
        // also verify the _actions file is there
        var actionsFile = outputDir+controller+'/_actions.js'
        fs.exists(actionsFile,function(exists) {
          t.ok(exists,actionsFile + " exists")
        })
      })
    });

  })

});