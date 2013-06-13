var fs = require('fs')
var router = require('./generators/router');
var controller = require('./generators/controllers')
var view = require('./generators/views')

exports.name = "makomi-express" // FIXME: almost certainly possible to do introspection here, right?

// export only the methods we really want to be public

// generates basic package structure
exports.initialize = require('./initializer.js').initialize

// generate the things that change a lot: routes, controllers, views, models
exports.generate = function (sourceDir,outputDir,cb) {
  // GENERATE ALL THE THINGS
  // TODO: you should be able to substitute your own generator if you don't like the default
  // TODO: no error handling here either. I should do some of that.

  // FIXME: I'm sure this could be more elegant, or at least less dorkily named
  var thingsToDo = 3;
  var didAThing = function() {
    thingsToDo--;
    if (thingsToDo == 0) cb();
  }

  // these can all operate in parallel, so let 'em

  var routingFile = sourceDir + "routes.json"
  router.generate(routingFile,outputDir,function(er) {
    didAThing()
  })

  var controllerDir = sourceDir + "controllers/"
  var controllerOutput = outputDir + "controllers/"
  fs.mkdir(controllerOutput,null,function() {
    controller.generate(controllerDir,controllerOutput,function(er) {
      didAThing()
    })
  })

  var viewDir = sourceDir + "views/"
  var viewOutput = outputDir + "views/"
  fs.mkdir(viewOutput,null,function() {
    view.generate(viewDir,viewOutput,function(er) {
      didAThing()
    })
  })

}

// render a specific route of the app, for previewing purposes
// (Requires that the app is correctly generated)
exports.render = require('./renderer.js').render