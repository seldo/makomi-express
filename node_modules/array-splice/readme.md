# array-splice

Javascript's Array.splice() method is fucking useless.

Usage:
var parent = [1,2,99,5,6]
var splice = [3,4]
var removed = array-splice.splice(parent,2,1,splice)

Now:
parent = [1,2,3,4,5,6]
removed = [99]
