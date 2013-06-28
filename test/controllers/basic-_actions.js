/**
 * Each action lives in its own file, _actions pulls them together
 * and defines what they are called.
 * @type {*}
 */
var test = require('tape');
var generator = require('../../generators/controllers.js');
var testUtil = require('../util')

test('create actions file for basic controller', function(t) {

  var sourceDir = "./test/data/testapp1/.makomi/controllers/"
  var controller = "basic"
  var expectedOutputFile = "./test/data/testapp1/expected/controllers/basic/expected._actions.js"

  testUtil.compareToExpectedOutput(t,expectedOutputFile,function(callWithOutput){
    generator.createActions(sourceDir,controller,function(output) {
      callWithOutput(output)
    })
  })

});