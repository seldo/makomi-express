/**
 * Testing simplest possible controller
 * @type {*}
 */
var test = require('tape');
var generator = require('../../generators/controllers.js');
var fs = require('fs-extra');

test('create flat action of basic controller', function(t) {

  var sourceDir = "./test/data/testapp1/.makomi/controllers/"
  var controller = "basic"
  var action = "flat"
  var expectedOutputFile = "./test/data/testapp1/expected/controllers/basic/expected.flat.js"

  /*
  var compareToGeneratedFile = function(er,expected) {
    generator.createAction(sourceDir,controller,action,function(output) {
      var outputLines = output.split("\n")
      var expectedLines = expected.split("\n")

      t.plan(outputLines.length)

      outputLines.forEach(function(line,index) {
        t.equal(line,expectedLines[index])
      })

    })
  }

  fs.readFile(
    expectedOutputFile,
    'utf-8',
    compareToGeneratedFile
  )
  */

  compareToExpectedOutput(t,expectedOutputFile,function(callWithOutput){
    generator.createAction(sourceDir,controller,action,function(output) {
      callWithOutput(output)
    })
  })

});

var compareToExpectedOutput = function(test,expectedOutputFile,toCompare) {

  toCompare(function(output) {
    fs.readFile(
      expectedOutputFile,
      'utf-8',
      function(er,expected) {
        var outputLines = output.split("\n")
        var expectedLines = expected.split("\n")

        test.plan(outputLines.length)

        outputLines.forEach(function(line,index) {
          test.equal(line,expectedLines[index])
        })
      }
    )
  })
}