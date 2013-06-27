/**
 * Initializer tests.
 * @type {*}
 */
var test = require('tape');
var initializer = require('../../initializer.js');
var fs = require('fs');

test('initialize app', function(t) {

  var sourceDir = "./test/data/testapp1/"
  var outputDir = "/tmp/initializer/"

  var expectedFiles = ['package.json','app.js']

  // ensure our output directory exists
  fs.mkdir(outputDir,null,function() {

    t.plan(expected.length)

    initializer.initialize(sourceDir,outputDir,function() {

      expectedFiles.forEach(function(filename) {

        // get expected file
        fs.readFile(
          "./test/data/expected.controller." + filename,
          'utf-8',
          function(er,expectedBody) {
            // get actual file
            fs.readFile(outputDir + filename,'utf-8',function(er,actualBody) {
              t.equal(actualBody,expectedBody)
            })
          }
        )
      })
    });

  })

});

test('generate controllers', function (t) {

  var controllerDir = "./test/data/testapp/controllers/"
  var outputDir = "/tmp/controllers/";
  var expectedFiles = ['index.js','users.js']

  t.plan(expectedFiles.length)

  // ensure our output directory exists
  fs.mkdir(outputDir,null,function() {

  }) // FIXME: Y U SO DEEPLY NESTED

});