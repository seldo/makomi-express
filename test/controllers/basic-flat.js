/**
 * Testing simplest possible controller
 * @type {*}
 */
var test = require('tape');
var initializer = require('../../generators/controllers.js');
var fs = require('fs-extra');
var mkSrc = require('makomi-source-util');

test('create basic controller, flat action', function(t) {

  var sourceDir = "./test/data/testapp1/"
  var expectedOutputFile = "./test/data/expected.app.js"

  var compareToGeneratedFile = function(er,expected) {
    mkSrc.loadDefinition(sourceDir,function(definition) {
      var output = initializer.createAppJS(definition)
      var expectedLines = expected.split("\n")
      var outputLines = output.split("\n")

      t.plan(outputLines.length)

      outputLines.forEach(function(line,index) {
        t.equal(line,expectedLines[index])
      })
    })
  }

  var expectedFile = fs.readFile(
    expectedOutputFile,
    'utf-8',
    compareToGeneratedFile
  )

});