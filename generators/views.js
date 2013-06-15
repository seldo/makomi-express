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
 * Look at every tag to see if it's a matching yieldpoint
 * If so replace it with the payload
 * Return the dom.
 * Recurse into any children.
 * FIXME: would yield multiple times for the same name. Good or bad?
 * @param dom
 * @param yieldpoint
 * @param payload
 */
exports.recursiveYield = function(dom,yieldpoint,payload,cb) {

  require('easy-splice')
  var toHandle = dom.length;
  var handled = function() {
    toHandle--
    if (toHandle == 0) {
      cb(dom);
    }
  }

  dom.forEach(function(element,index) {
    // depth first
    if(element.children) {
      toHandle++
      exports.recursiveYield(element.children,yieldpoint,payload,function(returnedDom) {
        element.children = returnedDom
        handled()
      })
    }
    // now handle the tag itself
    if(element.type == 'tag' && element.name == 'yield') {
      // labelled
      if (element.attribs && element.attribs.name) {
        if (element.attribs.name == yieldpoint) {
          console.log("Replaced yield " + yieldpoint + " with payload")
          dom.usefulSplice(index,1,payload.children)
        }
      } else {
        // unlabelled
        if ( (!element.attribs || !element.attribs.name) && yieldpoint == '_unlabelled_') {
          console.log("Replaced unlabelled yield with payload ")
          dom.usefulSplice(index,1,payload.children)
          console.log(dom)
        }
      }
      // no other substitution cases
    }
    handled()
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
  var htmlparser = require('htmlparser')
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
          exports.translateDom(element.children,function(translated,arrivingPayloads) {
            // merge arriving payloads into our current payload stack
            for(var p in arrivingPayloads) {
              payloads[p] = arrivingPayloads[p]
            }
            element.children = translated
            isHandled()
          })
        }
        var parseRoot = "./test/data/testapp/views/"
        // decide what to do with the element itself
        switch(element.name) {
          case "parent":
            // load and render the parent
            exports.parseFile(parseRoot + element.attribs.src,function(er,parentDom) {
              // find the yield point, add children of parent to that yield point
              var yieldpoints = htmlparser.DomUtils.getElementsByTagName('yield',parentDom)
              // FIXME: do something much smarter to find the matching yieldpoints
              for(var p in payloads) {
                exports.recursiveYield(parentDom,p,payloads[p],function(modifiedDom) {
                  parentDom = modifiedDom
                })
              }
              translated = translated.concat(parentDom)
              isHandled()
            })
            break;
          case "child":
            // FIXME: parseRoot should be relative to the first file passed in
            // TODO: verify attribs.src exists
            exports.parseFile(parseRoot+element.attribs.src,function(er,childDom) {
              translated = translated.concat(childDom)
              isHandled()
            })
            break;
          case "payload":
            /*
             Baby, I can see your payload
             You know you're my saving grace
             You're everything I need and more
             It's written all over your face
             */
            // if we find a payload, instead of including it at this level,
            // we push it onto the payloads package to be passed back up the stack
            if (element.attribs && element.attribs.yield) {
              payloads[element.attribs.yield] = element
              console.log("sent payload " + element.attribs.yield + " up the stack")
            } else {
              /*
              TODO: This way handled multiple unlabelled payloads but we're not sure
              if we're even gonna use this rendering engine so punt for now
              if(!payloads['_unlabelled']) payloads['_unlabelled'] = [];
              payloads['_unlabelled'].push(element)
              */
              payloads['_unlabelled_'] = element;
            }
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

  // FIXME: I think this only works because everything in it is synchronous
  dom.forEach(function(element,index) {
    switch(element.type) {
      case "comment":
        output += "<!-- " + element.raw + " -->"
        isHandled()
        break;
      case "directive":
        output += "<!" + element.raw + ">"
        isHandled();
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