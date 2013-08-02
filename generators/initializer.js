var mkSrc = require('makomi-source-util'),
    mkRun = require('makomi-express-runtime'),
    util = require('./../util.js'),
    fs = require('fs-extra'),
    _ = require('underscore');

/**
 * Create a new app skeleton, e.g. npm install express or whatever
 */
exports.initialize = function(sourceDir,outputDir,devMode,cb){

  var tasks = 2;
  var complete = function() {
    tasks--;
    if (tasks == 0) {
      cb()
    }
  }

  // TODO: check outputDir and sourceDir exist and make sense
  // TODO: maybe checksum files to avoid overwriting manual edits?

  // TODO: if we override the app structure we do it here
  mkSrc.loadDefinition(sourceDir,function(definition) {

    // create the package file
    var packageObject = exports.createPackage(definition);
    util.writeFile(
      JSON.stringify(packageObject,null,2),
      'package.json',
      outputDir,
      complete
    );

    // create app.js
    var appFile = exports.createAppJS(definition);
    util.writeFile(
      appFile,
      'app.js',
      outputDir,
      complete
    )

    // copy the contents of public, unmolested
    var dirsToCopy = [
      'public'
    ]
    tasks += dirsToCopy.length
    dirsToCopy.forEach(function(dir) {
      fs.copy(sourceDir+dir,outputDir+dir,function() {
        complete()
      })
    })


    // generate any directories not already generated
    var dirsToCreate = [
      'controllers',
      'models',
      'views',
      'public/javascripts',
      'public/stylesheets',
      'test'
    ]
    tasks += dirsToCreate.length;
    dirsToCreate.forEach(function(dir) {
      fs.mkdirs(outputDir+dir,function(err) {
        if (err) {
          console.log(err)
        }
        complete()
      })
    })

  });

}

exports.createPackage = function(definition) {
  // FIXME: insufficient, but enough for npm to work
  var package = {
    name: definition.name,
    version: definition.version,
    private: true,
    dependencies: definition.dependencies
  }
  return package;
}

// TODO: split sections into their own methods so we can test them independently
exports.createAppJS = function(definition) {

  var out = "/**\n" +
    " * GENERATED MAKOMI APP: " + definition.name + "\n" +
    " * IF YOU EDIT THIS YOUR CHANGES WILL BE LOST WHEN YOU RECOMPILE\n" +
    " */\n\n"

  var requiredPackages = {
    'express':'express',
    'http':'http',
    'Cookies':'cookies',
    'connect':'connect',
    'path':'path',
    'io':'socket.io',
    'sio':'socket.io-sessions',
    'MemoryStore':'connect/lib/middleware/session/memory',
    'mkEx':'makomi-express-runtime'
  }
  out += 'var '
  out += _.map(requiredPackages,function(value,key,list) {
    return key + " = require('" + value + "')"
  }).join(",\n  ") + ";\n\n"

  out += "// boot express\n"
  out += "var app = express();\n\n"

  out += "// configure express\n"
  var sets = {
    "port":"process.env.PORT || 3001",
    "views":"__dirname + '/views'",
    "view engine":"'hbs'"
  }

  out += _.map(sets,function(value,key,list) {
    return "app.set('" + key + "', " + value + ");"
  }).join("\n") + "\n\n"

  out += "// standard middleware\n"
  var uses = [
    "express.favicon()",
    "express.logger('dev')",
    "express.bodyParser()",
    "express.methodOverride()"
  ]

  out += _.map(uses,function(middleware) {
    return "app.use(" + middleware + ");"
  }).join("\n") + "\n\n"

  out += "// load application-level config once per node\n"
  out += "var appConfigFile = process.env.MAKOMICONF || '/etc/makomi/makomi.conf'\n" +
    "appConfig = {} // this is available globally once loaded\n\n" +
    "// everything in here waits until config is available\n" +
    "mkEx.util.loadConfig(appConfigFile,function(config) {\n"

  out += "  appConfig = config;\n\n"

  out += "  // sessions\n" +
    "  var sessionStore = new MemoryStore;\n" +
    "  app.use(express.cookieParser());\n" +
    "  app.use(express.session({\n" +
    "    secret: appConfig.sessions.secret,\n" +
    "    store: sessionStore\n" +
    "  }));\n\n"

  out += "  // router\n" +
    "  app.use(app.router);\n" +
    "  require('./router.js')(app);\n\n"

  out += "  // stylesheets and static content\n" +
    "  app.use(require('stylus').middleware(__dirname + '/public'));\n" +
    "  app.use(express.static(path.join(__dirname, 'public')));\n\n"

  out += "  // dev-only middleware\n" +
    "  if ('development' == app.get('env')) {\n" +
    "    app.use(express.errorHandler());\n" +
    "  }\n\n"

  out += "  // start the server\n" +
    "  var server = http.createServer(app).listen(app.get('port'), function(){\n" +
    "    console.log('" + definition.name + " listening on port ' + app.get('port'));\n" +
    "  });\n\n"

  out += "  // start websocket support (sorry, socket.io's magic, not mine)\n" +
    "  var socketServer = io.listen(server,{log: false})\n" +
    "  var sessionSocketServer = sio.enable({\n" +
    "    socket: socketServer,\n" +
    "    store:  sessionStore,\n" +
    "    parser: connect.cookieParser()\n" +
    "  });\n" +
    "  mkEx.sockets.start(socketServer,__dirname)\n"

  out += "});\n"

  return out
}