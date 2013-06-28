/**
 * Testing simplest possible controller
 * @type {*}
 */
var test = require('tape');
var generator = require('../../generators/controllers.js');
var testUtil = require('../util');

test('create flat action of basic controller', function(t) {

  var sourceDir = "./test/data/testapp1/.makomi/controllers/basic/"
  var controller = "basic"
  var action = "flat"
  var expectedOutputFile = "./test/data/testapp1/expected/controllers/basic/expected.flat.js"

  testUtil.compareToExpectedOutput(t,expectedOutputFile,function(callWithOutput){
    generator.createAction(sourceDir,controller,action,function(output) {
      callWithOutput(output)
    })
  })

});
