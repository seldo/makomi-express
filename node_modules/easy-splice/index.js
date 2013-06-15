Array.prototype.usefulSplice = function(index, length, arrayToInsert) {
  Array.prototype.splice.apply(this, [index, length].concat(arrayToInsert));
}