/**
 * Initializer tests.
 * @type {*}
 */
var test = require('tape');
var initializer = require('../../initializer.js');
var fs = require('fs');
var mkSrc = require('makomi-source-util');

test('app file creation, line by line', function(t) {

  var sourceDir = "./test/data/testapp1/"
  var expectedOutputFile = "./test/data/testapp1/expected/expected.package.json"

  t.plan(1)

  var compareToGeneratedFile = function(er,expectedString) {
    var expected = JSON.parse(expectedString)
    mkSrc.loadDefinition(sourceDir,function(definition) {
      var output = initializer.createPackage(definition)
      t.deepEqual(output,expected)
    })
  }

  var expectedFile = fs.readFile(
    expectedOutputFile,
    'utf-8',
    compareToGeneratedFile
  )

});