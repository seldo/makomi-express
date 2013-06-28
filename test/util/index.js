var fs = require('fs-extra')

exports.compareToExpectedOutput = function(test,expectedOutputFile,toCompare) {

  toCompare(function(output) {
    fs.readFile(
      expectedOutputFile,
      'utf-8',
      function(er,expected) {
        var outputLines = output.split("\n")
        var expectedLines = expected.split("\n")

        test.plan(outputLines.length)

        outputLines.forEach(function(line,index) {
          test.equal(line,expectedLines[index])
        })
      }
    )
  })
}