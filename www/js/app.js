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
    })

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

app.controller('ListCtrl', function($scope) {
    console.log("aca");
});

app.run(function($rootScope, $state, $ionicPlatform, $cookieStore, $http, User) {
    
  $rootScope.globals = $cookieStore.get('globals') || {};
  if ($rootScope.globals.currentUser) {
         //$http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
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