/**
 * Controller generator tests
 * @type {*}
 */
var test = require('tape');
var generator = require('../../generators/controllers.js');
var fs = require('fs-extra');

test('generate basic controller', function(t) {

  var rootDir = "./test/data/testapp1/.makomi/controllers/"
  var controller = "basic"
  var outputDir = "/tmp/controllers/"

  var expected = ['_actions.js','flat.js']
  t.plan(expected.length)

  // we are merely verifying the files got written correctly
  // the content of the files is tested elsewhere
  fs.mkdirs(outputDir,null,function() {
    generator.createController(rootDir,controller,outputDir,function() {
      generator.findFiles(outputDir+controller,function(er,files){
        expected.forEach(function(expectedFile) {
          t.notEqual(
            files.indexOf(expectedFile),
            -1,
            "file " + expectedFile + " present in the list"
          )
        })
      })
    })
  }) // FIXME: Y U SO NESTED?

});