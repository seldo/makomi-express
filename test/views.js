/**
 * View generator tests
 * @type {*}
 */
var test = require('tape');
var generator = require('../generators/views.js');
var fs = require('fs');
var util = require('util');

test('parse a single template chain', function (t) {

  var filename = "./test/data/testapp/views/index.mejs"

  generator.parseFile(filename,function(er,dom) {
    console.log("Generator expanded " + filename)
    console.log(util.inspect(dom,false,null))
    generator.toHtml(dom,function(html) {
      console.log(html);
    });

  });

  t.end() // fuck this no tests

});