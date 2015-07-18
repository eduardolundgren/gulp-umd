;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['m0', 'm1amd', 'm2amd'], factory);
  } else if (typeof exports === 'object') {
    factory(exports, require('m0'), require('m1cjs'), require('m2cjs'));
  } else {
    // Browser globals
    factory((root.Foo = {}), root.m0, root.m1glob, root.m2glob);
  }
}(this, function (exports, m0, m1param, m2param) {
'use strict';
function Foo() {}

exports.Foo = Foo;
}));
