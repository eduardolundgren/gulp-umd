(function (root, factory) {
<%= indent %>if (typeof define === 'function' && define.amd) {
<%= indent %><%= indent %>define(<%= amd %>, factory);
<%= indent %>} else if (typeof exports === 'object') {
<%= indent %><%= indent %>module.exports = factory(<%= cjs %>);
<%= indent %>} else {
<%= indent %><%= indent %>root.<%= namespace %> = factory(<%= global %>);
<%= indent %>}
}(this, function (<%= param %>) {
<%= indent %><% var c = getContentsWithIndent(1); %><%= c %>
<%= indent %>return <%= exports %>;
}));
