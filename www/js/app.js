(function() {

var app = angular.module('events', ['ionic', 'events.user', 'ngRoute', 'ngCookies']);

app.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  });
  
   $stateProvider.state('menu', {
      url: '/side-menu',
      abstract:true,
      templateUrl: 'templates/menu.html'
    });

  $stateProvider.state('menu.list', {
      url: '/list',
      cache: false,
      views: {
        'side-menu': {
          templateUrl: 'templates/eventos.html',
          controller: 'ListCtrl'
        }
      }
    });

  $urlRouterProvider.otherwise('/login');
});

app.controller('LoginCtrl', function($scope, $state, $ionicHistory, $ionicPopup, User) {
    
  $scope.credentials = {
    user: '',
    password: ''
  };

  $scope.login = function() {
    User.login($scope.credentials, function(response){
        if (response) {
            console.log(response);
            $ionicHistory.nextViewOptions({historyRoot: true});    
            $state.go('menu.list');
        } else {
            var alertPopup = $ionicPopup.alert({
                title: 'Ops!',
                template: 'Usuario o contraseña incorrecta'
            });
            alertPopup.then();
        }
        
    });
  };

});

app.controller('ListCtrl', function($scope, $cookieStore, $http) {
    //$scope.globals = $cookieStore.get('globals') || {};
    
    
    $scope.events = [];
    var apiUrl = 'http://localhost/eventos/api/events/all_events';
    
   /* $http.get(apiUrl)
              .success(function(response){
                  angular.forEach(response, function(child){
                        $scope.events.push(child);     
                  });
    }); */
    
     $scope.loadMore = function() {
         
         if($scope.events.length > 0){
            var after = $scope.events[$scope.events.length -1].info.ev_id;
            console.log($scope.events[$scope.events.length -1].info.ev_id);
            apiUrl = 'http://localhost/eventos/api/events/all_events/after/' + after;
          }
                         
            $http.get(apiUrl)
              .success(function(response){
                  angular.forEach(response, function(child){
                        $scope.events.push(child);     
                  });
              $scope.$broadcast('scroll.infiniteScrollComplete');
            }).error(function(){
              $scope.$broadcast('scroll.infiniteScrollComplete');
            });
    };
    
    /*$scope.$on('$stateChangeSuccess', function() {
        $scope.loadMore();
    }); */
    
    
    
    
});

app.run(function($rootScope, $state, $ionicPlatform, $cookieStore, $http, User) {
    
  $rootScope.globals = $cookieStore.get('globals') || {};
  if ($rootScope.globals.currentUser) {
         $http.defaults.headers.common.Authorization = 'Basic ' + $rootScope.globals.currentUser.authdata;
  }
    
  $rootScope.$on('$stateChangeStart', function(event, toState) {
    if (!User.isLoggedIn() && toState.name !== 'login') {
      event.preventDefault();
      $state.go('login');
    }
  });

  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

}());