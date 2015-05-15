/*

This is an illustrative if somewhat oversimplified example of how to create a common badgevilleAPI that will serve as the
front-end model layer. Idea is separation of concerns: stick universal business logic in this module,
and then wrap it so that the same logic could be DRY-ly used in jQuery, AngularJS, backbone, node, etc versions
of a BadgevilleAPI module (or plugin, or package, or extension, whatever). 

This module executes as a Javascript IIFE (immediately-invoked function expression) which just exports a single 
Javascript object into the global scope which then becomes the thing we wrap to ingest into a library/framework specific service.

A production version of this would (at least) be minified itself, and include intermediate build ingredients
such as its own constants, libraries, etc. In addition it would be separately unit-tested from library- or framework-
specific view and/or controller code focused on UI. It might even include some kind of basic/fallback/optional network
functionality such that it could be used by 3rd parties as a fully functional drop-in javascript API module. 
And build tooling could be created so that different versions of it could be built to include or not include (and 
therefore optionally use or not) those less core functionalities.

-Monir

*/
var badgevilleAPI = (function(){

  var privateAdder = function(a, b) {
    return a + b;
  };

  this.exports = {};

  exports.addNumbers = function(a, b) {
    return privateAdder(a, b);
  }

  exports.copyrightMessage = function() {
    return 'Copyright (c) 2015 Badgeville - blame monir@badgeville.com';
  }

  return exports;

})();