/**
 * Controller generator tests
 * @type {*}
 */
var test = require('tape');
var generator = require('../../generators/controllers.js');
var fs = require('fs-extra');

test('generate controllers', function (t) {

  var rootDir = "./test/data/testapp/.makomi/"
  var outputDir = "/tmp/controllers/";
  var expectedFiles = ['index.js','users.js']
  var expectedFilePath = "./test/data/testapp/expected/expected.controller."

  t.plan(expectedFiles.length)

  // ensure our output directory exists
  fs.mkdir(outputDir,null,function() {

    generator.generate(controllerDir,outputDir,function() {

      expectedFiles.forEach(function(filename) {

        // get expected file
        fs.readFile(
          expectedFilePath + filename,
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
  }) // FIXME: Y U SO DEEPLY NESTED

});