/**
 * Takes the meta-templates in ./makomi/views and translates them into
 * a format our engine understands; in this case that's handlebars.
 * This is just one way to do it. A different view engine could try reading
 * the layouts in the controllers and pre-generating the whole thing.
 * Or you could write your own templating engine that understands makomi-*
 * tags natively, so then the whole operation becomes a file copy. Whatever.
 *
 * The only caveat is that if "devMode" is true you need to ensure your
 * output contains placeholder comments for makomi-id-containing elements
 * that you have replaced, so that the editor can find them and map them
 * back to the original source.
 */

var fs = require('fs-extra')
var htmlparser = require('htmlparser')
var util = require('util')
var splicer = require('array-splice')
var mkSrc = require('makomi-source-util')

/**
 * Read all the template files and translate each one
 */
exports.generate = function(templateRoot,outputDir,devMode,cb) {

  var recursiveGenerate = function(templatePath,cb) {

    var fullTemplatePath = templateRoot+templatePath
    fs.readdir(fullTemplatePath,function(er,files) {

      // FIXME: as usual, ignores what happens if there are no files...
      var count = files.length;
      var complete = function() {
        count--
        if (count==0) cb()
      }

      files.forEach(function(file) {
        fs.stat(fullTemplatePath+file,function(er,stats) {
          if(stats.isDirectory()) {
            recursiveGenerate(templatePath+file+'/',function() {
              //console.log("Finished directory " + file)
              complete()
            });
          } else {
            // must be an HTML file
            var fileParts = file.split('.');
            if (fileParts.pop() == 'html') {
              var outFileName = fileParts.join('.');
              exports.createView(templateRoot,templatePath+outFileName,devMode,function(er,html) {
                fs.mkdirs(outputDir+templatePath,function() {
                  var fullOutPath = outputDir+templatePath+outFileName+'.hbs'
                  fs.writeFile(
                    fullOutPath,
                    html,
                    null,
                    function(er) {
                      if (er) console.log("Error writing file to " + fullOutPath)
                      //console.log("Wrote file " + fullOutPath)
                      complete()
                    }
                  )
                })
              })
            } else {
              console.log("Ignored non-template file " + file)
              complete();
            }
          }
        })
      })
    })

  }

  recursiveGenerate('',function() {
    cb()
  })

}

/**
 * Given a template file, parses it and translates it into the handlebars
 * equivalent. Will recursively parse includes.
 * @param templateFile  Full path to the template
 * @param cb            Called when done
 */
exports.createView = function(templateRoot,templatePath,devMode,cb) {

  exports.parseFile(templateRoot,templatePath,devMode,function(er,translatedDom) {
    //console.log("Parsed " + templatePath + " to ")
    //console.log(util.inspect(translatedDom,{depth:null}))
    exports.toHtml(translatedDom,function(er,html) {
      // TODO: error handling
      cb(er,html)
    })
  })

}

/**
 * Parses template file into a data structure and performs translation on it.
 * Returns the DOM structure of the result, for further manipulation
 * @param filename
 * @param cb
 */
exports.parseFile = function(templateRoot,templatePath,devMode,cb) {

  var filename = templateRoot + templatePath + '.html'

  fs.readFile(filename,'utf-8',function(er,rawHtml) {

    // get HTMLparser to do the heavy lifting
    var handler = new htmlparser.DefaultHandler(function (er, dom) {
      // translate our elements
      exports.translateDom(templateRoot,handler.dom,devMode,function(translated,payloads) {
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
exports.translateDom = function(templateRoot,dom,devMode,cb) {

  //console.log("Translating DOM tree of:")
  //console.log(util.inspect(dom,{depth:null}));

  // anything that needs to be passed back from children and dealt with at this level
  var payloads = {}

  // counter+callback idiom
  var count = dom.length
  var complete = function() {
    count--;
    if (count == 0) {
      cb(dom,payloads)
    }
  }

  dom.forEach(function(element,index) {
    // handle elements based on type
    if (domHandlers[element.type]) {

      domHandlers[element.type](templateRoot,element,index,devMode,function(translated,arrivingPayloads) {

        // replace the element with 0 or more translated elements
        splicer.splice(dom,index,1,translated);

        // add any payloads
        if (arrivingPayloads) {
          for(var p in arrivingPayloads) {
            payloads[p] = arrivingPayloads[p]
          }
        }
        complete()
      })
    } else {

      //console.log("Ignoring unhandled element type " + element.type + " [" + element.data + "]")
      complete()
    }
  })
}

var domHandlers = {}

/**
 * Maybe we'll strip comments of some kinds later?
 * @param element
 * @param index
 * @param cb
 */
domHandlers.comment = function(templateRoot,element,index,devMode,cb) {
  element.raw = "COMMENT:" + element.raw
  cb(element,null)
}

/**
 * Most things are tags. Tags can have children!
 * @param element
 * @param index
 * @param cb
 */
domHandlers.tag = function(templateRoot,element,index,devMode,cb) {

  var translated = null;
  var payloads = null;

  // how to handle the element itself, based on the tag name
  var handleTag = function() {
    if (domHandlers.tagHandlers[element.name]) {
      domHandlers.tagHandlers[element.name](templateRoot,element,devMode,function(tagTranslated) {
        translated = tagTranslated
        cb(translated,payloads)
      })
    } else {
      // we return unknown tags unchanged (cb expects an array)
      //console.log("Ignoring unhandled tag " + element.name)
      translated = [element]
      cb(translated,payloads)
    }

  }

  // handle children recursively. Can I really do this out of sync without going crazy?
  if (element.children) {
    exports.translateDom(templateRoot,element.children,devMode,function(childTranslated,childPayloads) {

      // replace children with their translated equivalents
      element.children = childTranslated

      // merge arriving payloads into our current payload stack
      if(childPayloads) {
        for(var p in childPayloads) {
          payloads[p] = childPayloads[p]
        }
      }

      // now deal with the tag itself
      handleTag()
    })
  } else {
    // if no kids, handle tag immediately
    handleTag()
  }


}

/**
 * Because a tag can expand into a whole dom tree in some cases, the output
 * of a tag handler is expected to be an array, even if it's just one element.
 * @type {{}}
 */
domHandlers.tagHandlers = {}

/**
 * Reads an entirely separate template and inserts it into the DOM
 * Includes can accept parameters that modify what they look like,
 * so every inclusion is a modified copy of the included code.
 * @param templateRoot
 * @param element
 * @param cb
 */
domHandlers.tagHandlers['makomi-include'] = function(templateRoot,element,devMode,cb) {
  if(element.attribs && element.attribs['src']) {
    exports.parseFile(templateRoot,element.attribs['src'],devMode,function(er,childDom) {
      // if in dev mode, we leave the parent tag in place
      if (devMode) {
        element.children = childDom
        cb([element])
      } else {
        cb(childDom)
      }
    })

  } else {
    console.log("Missing src attribute on <makomi-include>; ignoring")
    if (devMode) {
      cb([element])
    } else {
      cb([])
    }
  }
}

/**
 * Replace meta-vars with a handlebars {{variable}}
 * @param templateRoot
 * @param element
 * @param cb
 */
domHandlers.tagHandlers['makomi-var'] = function(templateRoot,element,devMode,cb) {
  if(element.attribs && element.attribs['name']) {
    var varText = "{{" + element.attribs.name + "}}"
    var varElement = {
      raw: varText,
      data: varText,
      type: "text"
    }
    if(devMode) {
      element.children = [varElement]
      cb([element])
    } else {
      cb([varElement])
    }

  } else {
    console.log("Missing name attribute on <makomi-var>; deleting")
    cb([])
  }
}

/**
 * Replace targets with handlebars {{{target}}}
 * Triple-staches are not escaped, so they can contain markup.
 * @param templateRoot
 * @param element
 * @param cb
 */
domHandlers.tagHandlers['makomi-target'] = function(templateRoot,element,devMode,cb) {
  if(element.attribs && element.attribs['name']) {
    var targetText = "{{{" + element.attribs.name + "}}}"
    cb([{
      raw: targetText,
      data: targetText,
      type: "text"
    }])
  } else {
    console.log("Missing name attribute on <makome-target>; deleting")
    cb([])
  }
}

// it's the same!
exports.toHtml = mkSrc.toHtml