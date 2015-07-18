;(function (exports<%= commaParam %>) {
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
})(this<%= commaCjs %>);
