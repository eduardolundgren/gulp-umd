;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(<%= amd %>, factory);
  } else {
    root.<%= namespace %> = factory(<%= global %>);
  }
}(this, function (<%= param %>) {
<%= contents %>
return <%= exports %>;
}));
