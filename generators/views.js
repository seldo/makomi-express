/**
 * Given a view directory and an output directory
 * Mash our meta-view format into something stupid EJS can fucking handle because EJS is dumb
 * There is probably some much smarter templating language I could be using.
 */

// TODO: this
exports.generate = function() {
  // get the controllers
  // find all the "root" views
  // generate full templates for each one
  // write to disk
}

/**
 * Given a template file, parses it and expands any parents and children
 * Continues recursively, then replies with a finished template.
 * So our views are DRY, but the generated templates are totally flat.
 * If your templating language is smarter than EJS, you don't have to generate
 * flat views. In fact, feel free to generate a templating language that
 * understands MEJS natively, and then this whole step can just be a file copy.
 */
exports.expand = function(filename,cb) {

  var htmlparser = require("htmlparser");
  var fs = require('fs');
  var util = require('util');

  console.log("Expanding " + filename)

  fs.readFile(filename,function(er,rawHtml) {
    var handler = new htmlparser.DefaultHandler(function (er, dom) {
      console.log("parsing done, I think?")
      cb()
    });
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(rawHtml);
    console.log(util.inspect(handler.dom, false, null));
  })

}