var test = require('tape');
var generator = require('../../generators/models.js');
var fs = require('fs-extra');

test('create single model', function(t) {

  var rootDir = "./test/data/testapp1/.makomi/models/"
  var modelName = "users"

  t.plan(1)

  generator.createModel(rootDir,modelName,function(modelCode) {
    // TODO: verify contents of file, not just existence
    console.log(modelCode)
    t.ok(true)
  })

});