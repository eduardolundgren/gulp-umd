;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(<%= amd %>, factory);
  } else if (typeof exports === 'object') {
    factory(exports<%= commaCjs %>);
  } else {
    // Browser globals
    factory((root.<%= namespace %> = {})<%= commaGlobal %>);
  }
}(this, function (exports<%= commaParam %>) {
<%= contents %><%
if (typeof exports == 'string') { %>
exports.<%= exports %> = <%= exports %>;<%
  } else {
    for (var key in exports) {
      if ({}.hasOwnProperty.call(exports,key)) {
%>
exports.<%= key %> = <%= exports[key] %>;<%
      }
    }
  }
%>
}));
