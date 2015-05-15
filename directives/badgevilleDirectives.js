// store directives here
// normally each directive would be in its own file and those files would be concatenated and minified in production
// here they are put together in one file for simplicity

myBadgevilleApp
.directive('playerDetail', function($log){
  return {
    restrict: 'E',
    scope: {
      id: '@'
    },
    link: function(scope, elem) {
      scope.$watch('id', showcase);

      function showcase(newVal){
        $log.debug('showcasing id called w value:', newVal);

        if (newVal) {
          elem.parent().addClass('focus');
        } else {
          elem.parent().removeClass('focus');
        }

      }

    }
  }
});