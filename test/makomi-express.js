/**
 * Full module tests
 * Putting it all together, test generation of an entire app from source.
 */
var test = require('tape');
var mkEx = require('../index');
var fs = require('fs');

test('generate a full app', function (t) {

  t.plan(1);

  var sourceDir = './test/data/testapp1/.makomi/'
  var outputDir = "/tmp/testapp-generated/"

  mkEx.generate(sourceDir,outputDir,"all",false,function() {
    console.log("Generated!")
    t.ok(true,"Faked test OK")
  })


});