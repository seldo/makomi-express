Array.prototype.usefulSplice = function(index, length, arrayToInsert) {
  Array.prototype.splice.apply(this, [index, length].concat(arrayToInsert));
}

var arr = ['a','b','c','d']
var ins = ['1','2','3']

arr.usefulSplice(1,2,ins)

console.log(arr)