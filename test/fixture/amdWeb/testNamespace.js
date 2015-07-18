;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.Foo.Bar = factory();
  }
}(this, function () {
'use strict';
function Foo() {}

return Foo;
}));
