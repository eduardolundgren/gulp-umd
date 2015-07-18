;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['m0', 'm1amd', 'm2amd'], factory);
  } else {
    root.Foo = factory(root.m0, root.m1glob, root.m2glob);
  }
}(this, function (m0, m1param, m2param) {
'use strict';
function Foo() {}

return Foo;
}));
