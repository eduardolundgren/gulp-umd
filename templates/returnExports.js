<%
  var amd_code = '';
  if (amd.length > 0) {
    amd_code = [];
    amd.forEach(function (item) { amd_code.push("'" + item + "'"); });
    amd_code = '[' + amd_code.join(', ') + '], ';
  }

  var cjs_code = '';
  if (cjs.length > 0) {
    cjs_code = [];
    cjs.forEach(function (item) { cjs_code.push("require('" + item + "')"); });
    cjs_code = cjs_code.join(', ');
  }

  var global_code = '';
  if (global.length > 0) {
    global_code = [];
    global.forEach(function (item) { global_code.push('root.' + item); });
    global_code = global_code.join(', ');
  }

  var param_code = '';
  if (param.length > 0) {
    param_code = param.join(', ');
  }
%>(function (root, factory) {
<%= indent %>if (typeof define === 'function' && define.amd) {
<%= indent %><%= indent %>define(<%= amd_code %>factory);
<%= indent %>} else if (typeof exports === 'object') {
<%= indent %><%= indent %>module.exports = factory(<%= cjs_code %>);
<%= indent %>} else {
<%= indent %><%= indent %>root.<%= namespace %> = factory(<%= global_code %>);
<%= indent %>}
}(this, function (<%= param_code %>) {
<%= indent %><% var c = getContentsWithIndent(1); %><%= c %>
<%= indent %>return <%= exports %>;
}));
