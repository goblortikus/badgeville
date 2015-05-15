var myBadgevilleApp = angular.module('myBadgevilleApp',[
  'ui.router'
  ]);

myBadgevilleApp
.constant('playersEndpoint', 'http://qa.badgeville.com/cairo/v1/877f63d3590e6ac4bf3e540ab2f02afc/sites/54ff9b925979db3ea4000097/players')
.constant('badgeville', (function(){return window.badgevilleAPI})()) // import badgevilleAPI service
.config(function($stateProvider, $urlRouterProvider,$logProvider) {
  $logProvider.debugEnabled(true);
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/players");
  //
  // Now set up the states
  $stateProvider
    .state('players', {
      url:'/players',
      templateUrl: 'partials/players.html',
      controller: 'playersController',
      controllerAs: 'Players'
    });
})
.controller('playersController', function($scope, $http, $log, getPlayers, badgeville){

  var ctrl = this; // expose top-level this object (so accessible from within functions)

  getPlayers.fetch().then(function(response){
    ctrl.players = response;
  });

  ctrl.twoNumbersAddedByBadgeville = badgeville.addNumbers(10,10);

  ctrl.showPlayerDetail = function(id) {
    $log.debug('See details for player w id: ', id);
    ctrl.playerId = id;
  };

  ctrl.clear = function() {
    $log.debug('clear');
    ctrl.playerId = '';
  }

})
.service('getPlayers', function($http, $log, $q, playersEndpoint) {

  var self = {},
      getNextPlayerBatch;

  self.players = [];
  
  // private recursive function to retrieve complete player dataset by offset pages.
  // this function is recursive in order to retrieve the entire data set for this programming test -- the api only provides page batches (partial dataset) at a time.
  // in production this would either be a more limited recursion (to fetch some limited initial data set) or
  // would be an on-demand page retrieval of some form (i.e. it would depend on the UI/UX situation and what demands that makes on the model layer)
  getNextPlayerBatch = function(offset){
    offset = offset || 0;
    // return promise structure (which may be recursively nested)
    return $http.jsonp(playersEndpoint+'?callback=JSON_CALLBACK', {params: {offset: offset}})
    .then(function(result) {
        var unwrappedPlayers;
        $log.debug('got players data batch: ', result);
        // check if players field exists
        if (result.data.players) {
          $log.debug('got players to unwrap: ', result.data.players);
          unwrappedPlayers = result.data.players;
        }
        // check if players field is an array and if so if it has any length
        $log.debug('unwrapped players: ', unwrappedPlayers, ' is array ? ', Array.isArray(unwrappedPlayers), 'of length: ', unwrappedPlayers.length);
        // make sure returned data is actually an array and has length
        if (Array.isArray(unwrappedPlayers) && unwrappedPlayers.length) { 
          $log.debug('unwrapped is array...', unwrappedPlayers, ' with length ', unwrappedPlayers.length);
          // append results to self.players array
          self.players = self.players.concat(unwrappedPlayers);
          $log.debug('post concatenation: ', self.players);
          // check if there could be more data... if so, call recursively with updated offset
          if (unwrappedPlayers.length == result.data._context_info.limit) {
            $log.debug('unwrapped call again ', unwrappedPlayers.length,result.data._context_info.limit);
            return getNextPlayerBatch(offset + result.data._context_info.limit);
          } else {
            // we are done. resolve promise (or recursive promise chain up to this point) with final value.
            $log.debug('returning final', self.players);
            return self.players;
          }
        } 
        // in case returned data is not array or 0 length, return what we've got
        else {
          return self.players;
        };
    }, 
    // hopefully we never get an error 
      function(e) {
        $log.error('got error: ', e);
      });    
  }

  // publicly exposed function
  self.fetch = function() {
    return getNextPlayerBatch();
  }

  // example of a environmental check/"compiler" flag - in our DEV or QA environments we may wish to expose normally private functions
  // for testing purposes; in the production environment we would not expose those functions. Use underscore as a convention
  // to indicate a function is private and not to be called from outside in production environment.

  // @if env!=production
  self._getNextPlayerBatch = getNextPlayerBatch;
  // @endif

  //return getNextPlayerBatch;
  return self;
  

})
