/**
 * View generator tests
 * @type {*}
 */
var test = require('tape');
var generator = require('../../generators/views.js');
var fs = require('fs-extra');
var testUtil = require('../util')
var util = require('util')
var _ = require('underscore')

test('parse all views for hello-2 app', function (t) {

  var templateRoot = "/tmp/makomi/hello-2/.makomi/views/"
  var outputDir = "/tmp/hello2views/"

  fs.mkdirs(outputDir,null,function() {
    generator.generate(templateRoot,outputDir,false,function() {
      console.log("Done")
      t.ok(true)
      t.end()
    })
  })

});