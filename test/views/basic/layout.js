/**
 * View generator tests
 * @type {*}
 */
var test = require('tape');
var generator = require('../../../generators/views.js');
var fs = require('fs-extra');
var testUtil = require('../../util')

test('parse the top-level layout file', function (t) {

  var templateRoot = "./test/data/testapp1/.makomi/views/"
  var templatePath = "layouts/default"
  var expectedOutputFile = "./test/data/testapp1/expected/views/layouts/expected.default.hbs"

  testUtil.compareToExpectedOutput(t,expectedOutputFile,function(callWithOutput) {
    generator.createView(templateRoot,templatePath,false,function(er,output) {
      callWithOutput(output)
    })
  })

});