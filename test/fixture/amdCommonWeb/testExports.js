;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    factory(exports);
  } else {
    // Browser globals
    factory((root.Foo = {}));
  }
}(this, function (exports) {
'use strict';
function Foo() {}

exports.Foo = Foo;
}));
