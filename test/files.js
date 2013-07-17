/**
 * Yes, we're testing that reading files works, because I was at this point
 * still learning how to use tape (and node in general).
 */
var test = require('tape');
var generator = require('../generators/router.js');
var fs = require('fs');

test('read file', function (t) {

    var expected = "CONTENTS\nOF\nFILE"

    t.plan(1);

    generator.read('./test/data/file.txt',function(er,file) {
        t.equal(file,expected)
    })

});

test('parse file', function (t) {

    t.plan(1);

    var expected = {
        "/": {
            "controller": "index"
        },
        "/users": {
            "controller": "users/list"
        }
    }

    generator.read('./test/data/basic.json',function(er,basicString) {
        generator.parse(basicString,function(er,parsedData) {
            t.deepEqual(parsedData,expected);
        })
    })

});