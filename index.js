var fs = require('fs-extra'),
  util = require('util'),
  _ = require('underscore');

exports.name = "makomi-express" // FIXME: almost certainly possible to do introspection here, right?

// we allow access to top-level generator functions only
exports.generators = {
  base: {
    path: '',
    generate: require('./generators/initializer').initialize
  },
  router: {
    path: '',
    generate: require('./generators/router').generate
  },
  views: {
    path: 'views/',
    generate: require('./generators/views').generate
  },
  models: {
    path: 'models/',
    generate: require('./generators/models').generate
  },
  controllers: {
    path: 'controllers/',
    generate: require('./generators/controllers').generate
  }
}

// generate the things that change a lot: routes, controllers, views, models
exports.generate = function (sourceDir,outputDir,toGenerate,devMode,cb) {

  // TODO: you should be able to substitute your own generator if you don't like the default
  // TODO: no error handling here either. I should do some of that.

  var targets = [
    "base",
    "router",
    "views",
    "models",
    "controllers"
  ]

  // default is "all"
  if(!toGenerate || toGenerate == 'all') toGenerate = targets

  // strings become arrays
  if (!util.isArray(toGenerate)) {
    toGenerate = [toGenerate]
  }

  // validate targets
  toGenerate.forEach(function(target) {
    if(!_.contains(targets,target)) {
      throw new Error("generate requires a valid target or array of targets; you passed " + toGenerate)
    }
  })

  var count = toGenerate.length
  var complete = function() {
    count--
    if (count == 0) cb();
  }

  // GENERATE ALL THE THINGS
  toGenerate.forEach(function(target) {
    var sourcePath = sourceDir + exports.generators[target].path
    var outputPath = outputDir + exports.generators[target].path
    fs.mkdirs(outputPath,function() {
      // TODO: still no error handling huh?
      //console.log("Calling " + target + " with source " + sourcePath + " and output " + outputPath)
      exports.generators[target].generate(sourcePath,outputPath,devMode,function() {
        //console.log(target + " completed")
        complete()
      })
    })
  })

}

// render a specific route of the app, for previewing purposes
// (Requires that the app is correctly generated)
exports.render = require('./renderer.js').render