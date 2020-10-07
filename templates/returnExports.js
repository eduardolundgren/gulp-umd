;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(<%= amd %>, factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(<%= cjs %>);
  } else {
    var _root = root;
    <% (Array.isArray(namespace) ? namespace : namespace.split(".")).forEach(function(name, index, list) { %><%if (index == (list.length - 1)) { %>_root["<%= name %>"] = factory(<%= global %>);<% } else { %>_root = (_root["<%= name %>"] = _root["<%= name %>"] || {});<% } %><% }); %>
  }
}(this, function(<%= param %>) {
<%= contents %>
return <%= exports %>;
}));
