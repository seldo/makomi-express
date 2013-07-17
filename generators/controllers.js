var fs = require('fs-extra');
var _ = require('underscore');
var mkSrc = require('makomi-source-util')

/**
 * Given the root of the controllers, find each controller
 * Generate _actions and action files for each controller
 * @param rootDir     controller source root, i.e. .makomi/controllers
 * @param outputDir   controllers directory of the output app
 * @param cb          called when all files written
 */
exports.generate = function(rootDir, outputDir, devMode, cb) {

  exports.findFiles(rootDir, function(er,controllers) {

    // TODO: filter out things that are not controllers?

    // the controllers are independent so we can read them all in parallel,
    // parse them in parallel, and just say when we're done.
    var count = controllers.length
    if (count == 0) cb()
    var complete = function() {
      count--
      if(count == 0) cb()
    }

    controllers.forEach(function(controller) {
      exports.createController(rootDir,controller,outputDir,function() {
        complete()
      })
    })

  })

}

/**
 * Given a controller directory and output directory
 * Parse each action file and generate action files for each controller
 * Plus an _actions file to glue each controller together
 * @param rootDir     controller source root, i.e. .makomi/controllers
 * @param controller  name of the controller, e.g. users
 * @param outputDir   controllers directory of the output app
 * @param cb          called when all files written to output
 */
exports.createController = function(rootDir, controller, outputDir, cb) {

  var controllerDir = rootDir + controller + '/'

  fs.mkdirs(outputDir+controller,null,function() {

    exports.listJSONFiles(controllerDir, function(actions) {

      var count = actions.length
      var complete = function() {
        count--
        if (count==0) cb()
      }

      // output _actions file
      count++
      exports.createActions(controllerDir,controller,function(body) {
        exports.write(
          outputDir+controller+'/',
          '_actions.js',
          body,
          function(er) {
            // TODO: error handling
            complete()
          }
        )
      })

      // output individual actions
      actions.forEach(function(action) {
        exports.createAction(controllerDir,controller,action,function(actionBody) {
          exports.write(
            outputDir+controller+'/',
            action+'.js',
            actionBody,
            function(er) {
              // TODO: error handling
              complete()
            }
          )
        })
      })

    })

  })
}

/**
 * Parse an action JSON file and generate the equivalent JS.
 * This is the heart of a makomi output engine.
 * @param controllerDir The directory with the source files for this controller, e.g. controllers/user
 * @param action
 * @param cb
 */
exports.createAction = function(controllerDir,controller,action,cb) {

  var fileReady = function(er,data) {

    // TODO: handle parse errors etc.
    var actionObject = JSON.parse(data);

    var output = "// " + actionObject.description + "\n\n"

    output +=
      "// AUTOMATICALLY GENERATED. DO NOT EDIT (yet).\n" +
      "// The droid you're looking for is .makomi/controllers/" + controller + "/" + action + ".json\n" +
      "// Some day, we'll allow you to edit this file and import changes back to the source.\n\n"

    var requires = {
      "MC": "emcee",
      "mkRun": "makomi-express-runtime"
      // TODO: add models to the list of requires
    }

    // writing javascript in javascript remains wacky-looking
    output += "var " + _.map(requires,function(packageName,localName,list) {
      return localName + " = require('" + packageName + "')"
    }).join(",\n  ") + ";\n\n"

    // an action file exports only one method, the action itself
    output += "module.exports = function(req, res) {\n\n"

    output += "  // load models, then do stuff\n" +
      "  var m = new MC();\n";

    // TODO: load models here, e.g.
    // m.load('model-name-here', req, appConfig)

    output += "  m.end(function(er,models) {\n\n"

    // TODO: translate placeholders in the layout object into code, not strings
    output += "    // define the data that will be passed to the view engine\n"
    output += "    var layout = " + indent(JSON.stringify(actionObject.layout,null,2),4) + ";\n\n"

    // TODO: just calling "send" is nowhere near good enough
    output += "    // call the view engine\n" +
      "    mkRun.compile(layout,function(renderedView) {\n" +
      "      res.send(renderedView)\n" +
      "    });\n"

    output += "  });\n\n"
    output += "};\n"

    cb(output)
  }

  // now actually do all that stuff
  var controllerFile = controllerDir+action+'.json'
  fs.readFile(
    controllerFile,
    'utf-8',
    fileReady
  )

}

var indent = function(string,size) {
  return string.split("\n").join("\n" + Array(size+1).join(" "))
}

/**
 * Read all the JSON files in a controller directory and create an _actions file
 * @param controllerDir The directory with the source files for this controller, e.g. controllers/user
 * @param controller    The name of the controller (used only to generate a comment)
 * @param cb
 */
exports.createActions = function(controllerDir,controller,cb) {

  var output =
    "// AUTOMATICALLY GENERATED. DO NOT EDIT.\n" +
    "// This is generated based on the files that exist in .makomi/controllers/" + controller + "\n\n"

  exports.listJSONFiles(controllerDir,function(actions) {

    output += actions.map(function(action) {
      return "exports." + action + " = require('./" + action + "')\n"
    })

    cb(output)
  })
}

/**
 * Find JSON files in a given directory, return as an array of bare names
 * @param dir
 * @param cb
 */
exports.listJSONFiles = function(dir,cb) {
  exports.findFiles(dir,function(er,rawFiles) {

    var fileList = []

    // FIXME: doesn't return if there are no files
    var count = rawFiles.length
    var complete = function() {
      count--
      if (count==0) cb(fileList)
    }

    rawFiles.forEach(function(file) {
      // FIXME: no error handling here either
      var filePart = file.split('.')
      if(filePart[1] == 'json') fileList.push(filePart[0])
      complete()
    })

  })
}

/**
 * Get a list of all the file names in a directory.
 * @param dir
 * @param cb
 */
exports.findFiles = function (dir, cb) {
  fs.readdir(dir, function (er, files) {
    // FIXME: handle errors
    //console.log("Finding files in " + dir)
    //console.log(files)
    cb(er,files)
  })
}

/**
 * Read in the file. Maybe also validate it here in future.
 * @param routingFile
 * @param cb
 */
exports.read = function (file, cb) {
  fs.readFile(file, 'utf-8', cb);
}

/**
 * Trivial to parse because it's JSON. Some validation a good idea in future.
 * @param routerString
 * @param cb
 */
exports.parse = function (fileString, cb) {
  var parsed = JSON.parse(fileString);
  // FIXME: catch errors, send them instead of always null
  var er = null;
  cb(er, parsed);
}

/**
 * Given a file "object", which contains a name and the file body, write that file
 * We are given the output dir for all these.
 * We may need some logic here to handle wacky/erroneous output locations/names.
 * @param fileObject
 * @param outputDir
 * @param cb
 */
exports.write = function (dir, name, body, cb) {

  var path = dir + name
  fs.writeFile(path, body, function (er) {
    if (er) {
      console.log(er);
    } else {
      console.log("Wrote " + path);
    }
    cb(er);
  });

}