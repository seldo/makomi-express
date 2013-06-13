/**
 * View generator tests
 * @type {*}
 */
var test = require('tape');
var generator = require('../generators/views.js');
var fs = require('fs');

test('expand a single template tree', function (t) {

  var filename = "./test/data/testapp/views/index.mejs"

  generator.expand(filename,function() {
    console.log("Generator expanded " + filename)
  });

  t.end() // fuck this no tests

});