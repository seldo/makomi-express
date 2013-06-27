/**
 * GENERATED MAKOMI APP: test-app-1
 * IF YOU EDIT THIS YOUR CHANGES WILL BE LOST WHEN YOU RECOMPILE
 */

var express = require('express'),
  Cookies = require('cookies'),
  connect = require('connect'),
  path = require('path'),
  io = require('socket.io'),
  sio = require('socket.io-sessions'),
  MemoryStore = require('connect/lib/middleware/session/memory'),
  socketController = require('./controllers/sockets'),
  mkEx = require('makomi-express-runtime');

// boot express
var app = express();

// configure express
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', hbs);

// standard middleware
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

// load application-level config once per node
var appConfigFile = process.env.MAKOMICONF || '/etc/makomi/makomi.conf'
appConfig = {} // this is available globally once loaded

// everything in here waits until config is available
mkEx.util.loadConfig(appConfigFile,function(config) {
  appConfig = config;

  // sessions
  var sessionStore = new MemoryStore;
  app.use(express.cookieParser());
  app.use(express.session({
    secret: appConfig.sessions.secret,
    store: sessionStore
  }));

  // router
  app.use(app.router);
  require('./router.js')(app);

  // stylesheets and static content
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));

  // dev-only middleware
  if ('development' == app.get('env')) {
    app.use(express.errorHandler());
  }

  // start the server
  var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('test-app-1 listening on port ' + app.get('port'));
  });

  // start websocket support (sorry, socket.io's magic, not mine)
  var socketServer = io.listen(server,{log: false})
  var sessionSocketServer = sio.enable({
    socket: socketServer,
    store:  sessionStore,
    parser: connect.cookieParser()
  });
  socketController.start(socketServer)
});
