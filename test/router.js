/**
 * Router generator tests
 * @type {*}
 */
var test = require('tape');
var generator = require('../generators/router.js');
var fs = require('fs-extra');

test('generate routing file', function (t) {

    t.plan(1);

    var routingFile = "./test/data/testapp1/.makomi/routes.json"
    var expectedOutputFile = "./test/data/testapp1/expected/expected.router.js"

    generator.read(routingFile,function(er,routerString) {
        generator.parse(routerString,function(er,routerObject) {
            generator.generator(routerObject,function(er,routerFile) {
                // compare to expected output
                fs.readFile(expectedOutputFile, 'utf-8', function(er,body) {
                    t.equal(routerFile,body)
                });
            })
        })
    })

});

test('write routing file to disk', function(t) {

  t.plan(1);

  var sourceDir = "./test/data/testapp1/.makomi/"
  var outputDir = "/tmp/router/"

  fs.mkdirs(outputDir,function() {
    generator.generate(sourceDir,outputDir,false,function() {
      var routerFile = outputDir+'router.js'
      fs.exists(routerFile,function(exists) {
        t.ok(exists,"Routing file written")
      })
    })
  })

})