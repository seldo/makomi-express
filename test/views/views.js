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

test('parse all views', function (t) {

  var templateRoot = "./test/data/testapp1/.makomi/views/"
  var outputDir = "/tmp/views/"
  var expectedOutput = {
    "_root": ["footer","more_news","nav","recent_news","welcome"],
    "basic": {
      "_root": ["flat"]
    },
    "emails": {
      "_root": ["newstatus"]
    },
    "layouts": {
      "_root": ["default"]
    },
    "status": {
      "_root": ["newsfeed","post"]
    },
    "user": {
      "_root": ["info","list","single","users"]
    }
  }

  var verifyFiles = function(t,expectedFiles,path,cb) {

    var count = 0;
    var complete = function() {
      count--;
      if (count==0) {
        cb();
      }
    }

    fs.readdir(path,function(er,files) {
      _.each(expectedFiles,function(value,key,list) {
        if(key == "_root") {
          // verify files at this level
          count += expectedFiles['_root'].length;
          expectedFiles['_root'].forEach(function(file) {
            var fullFile = path+file+'.hbs'
            fs.exists(fullFile,function(exists) {
              t.ok(exists, fullFile + " exists")
              complete()
            })
          })
        } else {
          // check this key has a directory
          count++
          var subDir = path+key
          fs.stat(subDir,function(er,stats) {
            if(stats.isDirectory()) {
              // recurse
              verifyFiles(t,expectedFiles[key],subDir+'/',function() {
                t.ok(true,subDir + " verified")
                complete()
              })
            }
          })
        }
      })
    })

  }

  fs.mkdirs(outputDir,null,function() {
    generator.generate(templateRoot,outputDir,false,function() {
      verifyFiles(t,expectedOutput,outputDir,function() {
        t.end()
      })
    })
  })

});