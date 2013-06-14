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
exports.parseFile = function(filename,cb) {

  var htmlparser = require("htmlparser");
  var fs = require('fs');

  console.log("Expanding " + filename)

  fs.readFile(filename,function(er,rawHtml) {
    // this is the callback when the parsing is done
    var handler = new htmlparser.DefaultHandler(function (er, dom) {
      console.log("Before:")
      console.log(dom);
      exports.translateDom(handler.dom,function(translated,payloads) {
        // payloads should be null at this level
        // FIXME: no error handling yet
        cb(er,translated)
      })
    });
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(rawHtml);
  })

}

/**
 * Reads every sibling element at the current level of the dom
 * Transforms them as necessary
 * Recurses down into any children
 * Callback is the translated structure, plus anything else that needs to get passed up the tree
 * @param dom
 * @param cb
 */
exports.translateDom = function(dom,cb) {
  // the translated dom
  var translated = []
  // content extracted from this level to be passed to yiel
  var payloads = {}

  // counter+callback idiom
  var handled = dom.length
  var isHandled = function() {
    handled--;
    if (handled == 0) {
      cb(translated,payloads)
    }
  }

  dom.forEach(function(element,index) {
    switch(element.type) {
      case "comment":
        element.raw = "COMMENT:" + element.raw
        translated.push(element)
        isHandled()
        break;
      case "tag":
        // handle children. Can I really do this out of sync without going crazy?
        if (element.children) {
          handled++
          exports.translateDom(element.children,function(translated,payloads) {
            element.children = translated
            // TODO: payload handling
            isHandled()
          })
        }
        // decide what to do with the element itself
        switch(element.name) {
          case "parent":
            translated.push(element)
            console.log("ignored parent " + element.raw)
            isHandled()
            break;
          case "child":
            // TODO: translate and expand the child file
            // FIXME: parseRoot should be relative to the first file passed in
            var parseRoot = "./test/data/testapp/views/"
            // TODO: verify attribs.src exists
            /*
            exports.parseFile(parseRoot+element.attribs.src,function(er,childDom) {
              translated.con(childDom)
              console.log("pushed stack resulting from parsing " + element.raw)
              isHandled()
            })
            */
            translated.push(element);
            isHandled();
            break;
          case "payload":
            /*
             Baby, I can see your payload
             You know you're my saving grace
             You're everything I need and more
             It's written all over your face
             */
            // TODO: push payloads up the stack
            translated.push(element)
            console.log("ignored payload " + element.raw)
            isHandled()
            break;
          default:
            // leave unrecognized tags unchanged
            translated.push(element)
            console.log("ignored unknown tag " + element.raw)
            isHandled()
            break;
        }
        break;
      default:
        // leave unrecognized element types unchanged
        translated.push(element)
        isHandled()
        break;
    }
  })
}

/**
 * Take our formatted dom structure and output actual HTML
 * @param dom
 * @param cb
 * @param depth
 */
exports.toHtml = function(dom,cb,depth) {
  if (!depth) depth = 0;

  // counter+callback idiom
  var handled = dom.length
  var isHandled = function() {
    handled--;
    if (handled == 0) {
      cb(output)
    }
  }

  var output = "";

  dom.forEach(function(element,index) {
    switch(element.type) {
      case "comment":
        output += "<!-- " + element.raw + " -->"
        isHandled()
        break;
      case "tag":
        output += "<" + element.raw + ">"
        var endTag = function() {
          if (element.name != '%=') {
            output += "</" + element.name + ">"
          }
        }
        if (element.children) {
          handled++
          exports.toHtml(element.children,function(html) {
            output += html
            endTag()
            isHandled()
          },depth+2)
          isHandled()
        } else {
          endTag()
          isHandled()
        }
        break;
      default:
        output += element.raw
        isHandled()
        break;
    }
  })

}