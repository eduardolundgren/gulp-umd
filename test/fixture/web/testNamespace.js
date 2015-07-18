;(function () {
'use strict';
function Foo() {}

this.Foo.Bar = Foo;
}).call(this);
