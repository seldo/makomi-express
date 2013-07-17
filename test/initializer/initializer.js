/**
 * Initializer tests.
 * @type {*}
 */
var test = require('tape');
var initializer = require('../../generators/initializer.js');
var fs = require('fs-extra');

test('initialize app', function(t) {

  var sourceDir = "./test/data/testapp1/.makomi/"
  var outputDir = "/tmp/initializer/"

  var expectedFiles = ['package.json','app.js']
  var expectedFolders = [
    'controllers',
    'models',
    'views',
    'public/javascripts',
    'public/stylesheets',
    'test'
  ]

  t.plan(expectedFiles.length+expectedFolders.length)

  var testExistence = function(root,paths) {
    paths.forEach(function(path) {
      fs.exists(root+path, function (exists) {
        t.ok(exists,path + " exists")
      });
    })
  }

  // clear our output directory before starting
  fs.removeSync(outputDir);
  fs.mkdir(outputDir,null,function() {

    // initialize testapp1
    initializer.initialize(sourceDir,outputDir,false,function() {

      // the other tests verify the content of the files
      // here we just verify their existence and relative locations are correct
      testExistence(outputDir,expectedFiles)
      testExistence(outputDir,expectedFolders)

    })

  })

});