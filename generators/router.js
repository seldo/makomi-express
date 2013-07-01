var _ = require('underscore'),
  fs = require('fs-extra');

/**
 * Given a routing file's location and output location, parse the routes
 * and write a router file to disk
 */
exports.generate = function(sourceDir,outputDir,cb){
    exports.read(sourceDir + 'routes.json',function(er,routerString) {
        exports.parse(routerString,function(er,routerObject) {
            exports.generator(routerObject,function(er,routingFile) {
              fs.writeFile(
                outputDir+'router.js',
                routingFile,
                null,
                function() {
                  cb();
                }
              );
            })
        })
    })
}

/**
 * File I/O! Yes I put it in its own method.
 * I dunno, maybe it'll be more complicated in future.
 * @param routingFile
 * @param cb
 */
exports.read = function(routingFile,cb) {
    var fs = require('fs');
    fs.readFile(routingFile, 'utf-8', cb);
}

/**
 * Also pretty dumb right now, since the format is JSON.
 * Later we'll probably be setting defaults and validating and shit in here.
 * @param routerString
 * @param cb
 */
exports.parse = function(routerString,cb) {
    var parsed = JSON.parse(routerString);
    // FIXME: catch errors, send them instead of always null
    var er = null;
    cb(er,parsed);
}

/**
 * This is the interesting bit. It generates the router, and also the controllers
 * referenced by that router. Writing javascript in javascript is pretty ugly.
 *
 * @param routerObject
 * @param cb
 */
exports.generator = function(routerObject,cb) {
  var output = "// AUTOMATICALLY GENERATED. DO NOT EDIT.\n" +
    "// The droid you're looking for is .makomi/routes.json\n\n" +
    "module.exports = function(app){\n";

  // map all the routes and build a list of active controllers
  var controllers = [];
  var routes = _.map(routerObject,function(route,path,list) {
    controllers.push(route.controller)
    return "app.get('" + path + "', " + route.controller + "." + route.action + ");"
  });

  // de-dupe the controllers
  var uniqueControllers = _.uniq(controllers);

  // output the controllers
  output += "  var " + uniqueControllers.map(function(controller) {
      return controller + " = require('./controllers/" + controller + "/_actions')"
  }).join("\n    , ") + ";\n\n"

  // output the routes
  output += "  " + routes.join("\n  ") + "\n"

  output += "}\n"

  cb(null, output)
}