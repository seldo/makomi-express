/**
 * Each action lives in its own file, _actions pulls them together
 * and defines what they are called.
 * @type {*}
 */
var test = require('tape');
var generator = require('../../generators/controllers.js');
var fs = require('fs-extra');
var mkSrc = require('makomi-source-util');

test('create actions file for basic controller', function(t) {

  var sourceDir = "./test/data/testapp1/.makomi/controllers/"
  var controller = "basic"
  var expectedOutputFile = "./test/data/testapp1/expected/controllers/basic/expected._actions.js"

  var compareToGeneratedFile = function(er,expected) {
    generator.createActions(sourceDir,controller,function(output) {
      console.log(output)

      var outputLines = output.split("\n")
      var expectedLines = expected.split("\n")

      t.plan(outputLines.length)

      outputLines.forEach(function(line,index) {
        t.equal(line,expectedLines[index])
      })
    });
  }

  var expectedFile = fs.readFile(
    expectedOutputFile,
    'utf-8',
    compareToGeneratedFile
  )

});