var mkSrc = require('makomi-source-util')
var mkRun = require('makomi-express-runtime')

/**
 * Render the given route into an edit-ready form.
 * @param route     The route
 * @param method    HTTP method
 * @param params    Parameters passed to the route
 * @param data      Data source(s) to override default data source(s) for the route
 */
exports.render = function (sourceDir, appLocation, route, method, params, data, cb) {

  // select controller based on route
  // TODO: differentiate between GET and POST etc.
  mkSrc.loadRoutes(sourceDir,function(routes) {
    var controllerName = routes[route].controller
    var actionName = routes[route].action
    mkSrc.loadController(sourceDir,controllerName,actionName,function(controller) {
      /**
       * Because we want to hijack so much of the request and response,
       * this essentially re-creates the controller.
       * FIXME: this will become trickier when people customize controllers.
       */
      //console.log(controller)

      // TODO: will need to load data and shit

      mkRun.compile(
        controller.layout,
        function(rendered) {
          cb({
            statusCode: 200,
            headers: {
              'content-type': "text/html"
            },
            body: rendered
          })
        },
        appLocation+'views/'
      )
    })
  })

}
