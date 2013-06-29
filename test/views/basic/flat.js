/**
 * View generator tests
 * @type {*}
 */
var test = require('tape');
var generator = require('../../../generators/views.js');
var fs = require('fs-extra');
var testUtil = require('../../util')

test('parse a single template', function (t) {

  var templateRoot = "./test/data/testapp1/.makomi/views/"
  var templatePath = "basic/flat"
  var expectedOutputFile = "./test/data/testapp1/expected/views/basic/expected.flat.hbs"

  testUtil.compareToExpectedOutput(t,expectedOutputFile,function(callWithOutput) {
    generator.createView(templateRoot,templatePath,function(er,output) {
      callWithOutput(output)
    })
  })

});