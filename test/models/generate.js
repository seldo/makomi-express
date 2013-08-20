var test = require('tape');
var generator = require('../../generators/models.js');
var fs = require('fs-extra');

test('generate all models', function(t) {

  var rootDir = "./test/data/testapp1/.makomi/models/"
  var outputDir = "/tmp/models/"
  var devMode = true;

  t.plan(1)

  fs.mkdirs(outputDir,function() {
    generator.generate(rootDir, outputDir, devMode, function() {
      fs.readdir(outputDir,function(er,files) {
        // TODO: work out expected file count better
        t.equals(files.length,1)
      })
    })
  })

});