var fs = require('fs');
var _ = require('underscore');

/**
 * Given a controller directory and output directory
 * Parse each action file and generate action files for each controller
 * Plus an _actions file to glue each controller together
 */

exports.generate = function (controllerDir, outputDir, cb) {
  exports.findFiles(controllerDir, function (er, fileList) {

    // the controllers are independent so we can read them all in parallel,
    // parse them in parallel, and just say when we're done.
    // FIXME: this doesn't work anymore
    /*
    var count = fileList.length;
    fileList.forEach(function (file) {
      exports.read(controllerDir + file, function (er, fileString) {
        exports.parse(fileString, function (er, fileObject) {
          exports.generator(fileObject, function (er, controllerFile) {
            exports.write(outputDir, function (er) {
              count--;
              if (count == 0) {
                console.log("Generated controllers")
                cb()
              }
            })
          })
        })
      })
    })
    */

  })
}

/**
 * Parse an action JSON file and generate the equivalent JS.
 * This is the heart of a makomi output engine.
 * @param controllerDir The directory with all the controller source files
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
  fs.readFile(
    controllerDir+controller+'/'+action+'.json',
    'utf-8',
    fileReady
  )

}

var indent = function(string,size) {
  return string.split("\n").join("\n" + Array(size+1).join(" "))
}

/**
 * Read all the JSON files in a controller directory and create an _actions file
 * @param controllerDir
 * @param cb
 */
exports.createActions = function(rootDir,controller,cb) {

  var output =
    "// AUTOMATICALLY GENERATED. DO NOT EDIT.\n" +
    "// This is generated based on the files that exist in .makomi/controllers/" + controller + "\n\n"

  exports.listJSONFiles(rootDir+controller,function(actions) {

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